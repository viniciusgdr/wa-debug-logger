const readline = require('readline')
const { makeWASocket, BinaryInfo, DisconnectReason, encodeWAM, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, makeCacheableSignalKeyStore, makeInMemoryStore, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey } = require('./baileys')
const fs = require('fs')
const { WebSocket } = require('ws')


const MAIN_LOGGER = require('./baileys/lib/Utils/logger.js').default
MAIN_LOGGER.level = 'fatal'

const client = new WebSocket('ws://localhost:8080');

client.on('open', () => {
    setInterval(() => {
        client.send(JSON.stringify({
            tag: 'ping'
        }));
    }, 10000);
});

const sendNodeToWebSocket = (data) => {
    client.send(JSON.stringify({
        type: 'BAILEYS',
        data: data
    }));
}

client.on('close', () => {
    console.log("WebSocket connection closed");
});


const useStore = !process.argv.includes('--no-store')
const usePairingCode = process.argv.includes('--use-pairing-code')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise<string>((resolve) => rl.question(text, resolve))

const store = useStore ? makeInMemoryStore({ logger: MAIN_LOGGER }) : undefined
store?.readFromFile('./baileys_store_multi.json')
setInterval(() => {
    store?.writeToFile('./baileys_store_multi.json')
}, 10_000)

const main = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('temp/baileys_auth_info')
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
    
    const sock = makeWASocket({
        version,
        sendNodeToWebSocket,
        logger: MAIN_LOGGER,
        printQRInTerminal: !usePairingCode,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, MAIN_LOGGER),
        },
        generateHighQualityLinkPreview: true
    })

    store?.bind(sock.ev)
    if (usePairingCode && !sock.authState.creds.registered) {
        const phoneNumber = await question('please enter your phone number:\n')
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(`pairing code: ${code}`)
    }

    sock.ev.process(
        async (events) => {
            if (events['connection.update']) {
                const update = events['connection.update']
                const { connection, lastDisconnect } = update
                if (connection === 'close') {
                    if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
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

            if (events['messages.update']) {
                // console.log(
                //     JSON.stringify(events['messages.update'], undefined, 2)
                // )

                for (const { key, update } of events['messages.update']) {
                    if (update.pollUpdates) {
                        const pollCreation = await getMessage(key)
                        if (pollCreation) {
                            // console.log(
                            //     'got poll update, aggregation: ',
                            //     getAggregateVotesInPollMessage({
                            //         message: pollCreation,
                            //         pollUpdates: update.pollUpdates,
                            //     })
                            // )
                        }
                    }
                }
            }

            if (events['message-receipt.update']) {
                // console.log(events['message-receipt.update'])
            }

            if (events['messages.reaction']) {
                // console.log(events['messages.reaction'])
            }
        }
    )
    return sock
}

main()