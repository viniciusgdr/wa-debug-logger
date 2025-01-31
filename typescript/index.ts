/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { Boom } from '@hapi/boom'
import NodeCache from 'node-cache'
import readline from 'readline'
import makeWASocket, { BinaryInfo, DisconnectReason, encodeWAM, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, makeCacheableSignalKeyStore, makeInMemoryStore, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey } from './baileys'
import MAIN_LOGGER from './baileys/src/Utils/logger'
import fs from 'fs'
import { WebSocketService } from './websocket'

MAIN_LOGGER.level = 'trace'

const useStore = !process.argv.includes('--no-store')
const usePairingCode = process.argv.includes('--use-pairing-code')

const msgRetryCounterCache = new NodeCache()

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text: string) => new Promise<string>((resolve) => rl.question(text, resolve))

const store = useStore ? makeInMemoryStore({ logger: MAIN_LOGGER }) : undefined
store?.readFromFile('./baileys_store_multi.json')
setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

const main = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    
    const server = new WebSocketService();
    server.send({
        type: 'baileys',
        data: 'LOG'
    })
    const sock = makeWASocket({
        version,
        logger: MAIN_LOGGER,
        printQRInTerminal: !usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, MAIN_LOGGER),
        },
        msgRetryCounterCache,
        generateHighQualityLinkPreview: true,
        getMessage,
    })

    store?.bind(sock.ev)
    if (usePairingCode && !sock.authState.creds.registered) {
        const phoneNumber = await question('Please enter your phone number:\n')
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`Pairing code: ${code}`)
    }

    sock.ev.process(
        async (events) => {
            if (events['connection.update']) {
                const update = events['connection.update']
                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    if ((lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                        main()
                    } else {
                        console.log('Connection closed. You are logged out.')
                    }
                }

                const sendWAMExample = false;
                if (connection === 'open' && sendWAMExample) {
                    const {
                        header: {
                            wamVersion,
                            eventSequenceNumber,
                        },
                        events,
                    } = JSON.parse(await fs.promises.readFile("./boot_analytics_test.json", "utf-8"))

                    const binaryInfo = new BinaryInfo({
                        protocolVersion: wamVersion,
                        sequence: eventSequenceNumber,
                        events: events
                    })

                    const buffer = encodeWAM(binaryInfo);

                    const result = await sock.sendWAMBuffer(buffer)
                    console.log(result)
                }

                console.log('connection update', update)
            }

            if (events['creds.update']) {
                await saveCreds()
            }

            if (events['labels.association']) {
                console.log(events['labels.association'])
            }


            if (events['labels.edit']) {
                console.log(events['labels.edit'])
            }

            if (events.call) {
                console.log('recv call event', events.call)
            }

            if (events['messaging-history.set']) {
                const { chats, contacts, messages, isLatest, progress, syncType } = events['messaging-history.set']
                if (syncType === proto.HistorySync.HistorySyncType.ON_DEMAND) {
                    console.log('received on-demand history sync, messages=', messages)
                }
                console.log(`recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest}, progress: ${progress}%), type: ${syncType}`)
            }

            if (events['messages.upsert']) {
                const upsert = events['messages.upsert']
                console.log('recv messages ', JSON.stringify(upsert, undefined, 2))

                if (upsert.type === 'notify') {
                    for (const msg of upsert.messages) {
                        if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
                            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text
                            if (text == "requestPlaceholder" && !upsert.requestId) {
                                const messageId = await sock.requestPlaceholderResend(msg.key)
                                console.log('requested placeholder resync, id=', messageId)
                            } else if (upsert.requestId) {
                                console.log('Message received from phone, id=', upsert.requestId, msg)
                            }

                            if (text == "onDemandHistSync") {
                                const messageId = await sock.fetchMessageHistory(50, msg.key, msg.messageTimestamp!)
                                console.log('requested on-demand sync, id=', messageId)
                            }
                        }
                    }
                }
            }

            if (events['messages.update']) {
                console.log(
                    JSON.stringify(events['messages.update'], undefined, 2)
                )

                for (const { key, update } of events['messages.update']) {
                    if (update.pollUpdates) {
                        const pollCreation = await getMessage(key)
                        if (pollCreation) {
                            console.log(
                                'got poll update, aggregation: ',
                                getAggregateVotesInPollMessage({
                                    message: pollCreation,
                                    pollUpdates: update.pollUpdates,
                                })
                            )
                        }
                    }
                }
            }

            if (events['message-receipt.update']) {
                console.log(events['message-receipt.update'])
            }

            if (events['messages.reaction']) {
                console.log(events['messages.reaction'])
            }

            if (events['presence.update']) {
                console.log(events['presence.update'])
            }

            if (events['chats.update']) {
                console.log(events['chats.update'])
            }

            if (events['contacts.update']) {
                for (const contact of events['contacts.update']) {
                    if (typeof contact.imgUrl !== 'undefined') {
                        const newUrl = contact.imgUrl === null
                            ? null
                            : await sock!.profilePictureUrl(contact.id!).catch(() => null)
                        console.log(
                            `contact ${contact.id} has a new profile pic: ${newUrl}`,
                        )
                    }
                }
            }

            if (events['chats.delete']) {
                console.log('chats deleted ', events['chats.delete'])
            }
        }
    )

    return sock

    async function getMessage(key: WAMessageKey): Promise<WAMessageContent | undefined> {
        if (store) {
            const msg = await store.loadMessage(key.remoteJid!, key.id!)
            return msg?.message || undefined
        }
        return proto.Message.fromObject({})
    }
}

main()