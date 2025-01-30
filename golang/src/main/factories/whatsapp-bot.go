package factories

import (
	data_usecases "boostify/src/data/usecases"
	domain_usecases "boostify/src/domain/usecases"
	infra_whatsmeow "boostify/src/infra/whatsapp/whatsmeow"

	"go.mau.fi/whatsmeow/store/sqlstore"
)

func MakeWhatsappBot(
	sessionContainer *sqlstore.Container,
	assistantId string,
) domain_usecases.Bot {
	whatsappConnectionRepository := infra_whatsmeow.NewWhatsappConnectionRepository(
		sessionContainer,
		assistantId,
	)
	dbWhatsAppBot := data_usecases.NewDbWhatsappBot(whatsappConnectionRepository)
	return dbWhatsAppBot
}
