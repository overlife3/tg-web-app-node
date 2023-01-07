const token = "5960419244:AAF81sGhBJZ3wP2_KrKSJziX5JjfQuQj-fk"

const TelegramBot = require('node-telegram-bot-api');
const express = require("express")
const cors = require("cors")

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json())
app.use(cors())


const webAppURL = "https://lucky-sorbet-fa1ce1.netlify.app/"

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
	const text = msg.text;

	if (text === "/start") {
		await bot.sendMessage(chatId, "Появиться кновка, заполни форму", {
			reply_markup: {
				keyboard: [
					[{text: "Заполни форму", web_app: {url: webAppURL + "form"}}]
				]
			}
		})
		
		await bot.sendMessage(chatId, "Заходи в наш интернет магазин по кнопке ниже", {
			reply_markup: {
				inline_keyboard: [
					[{text: "Сделать заказ", web_app: {url: webAppURL}}]
				]
			}
		})
	}

	if (msg?.web_app_data?.data) {
		try {
			const data = JSON.parse(msg?.web_app_data?.data)

			await bot.sendMessage(chatId, "Спасибо за обратную связь!")
			await bot.sendMessage(chatId, "Country: " + data?.country)
			await bot.sendMessage(chatId, "Street: " + data?.street)

			setTimeout(async () => {
				await bot.sendMessage(chatId, "Всю информацию вы получите в этом чате.")
			}, 3000)
		} catch (err) {
			console.log(err)
		}
	}
});

app.post("/web-data", async (req, res) => {
	const {queryId, products, totalPrice} = req.body
	try {
		await bot.answerWebAppQuery(queryId, {
			type: "article",
			id: queryId,
			title: "Успешная покупка",
			input_message_content: {message_text: "Поздравляю с покупкой, вы приобрели товар на сумму " + totalPrice}
		})
		return res.status(200).json({})
	} catch (err) {
		await bot.answerWebAppQuery(queryId, {
			type: "article",
			id: queryId,
			title: "Не удалось приобрести товар",
			input_message_content: {message_text: "Произошла ошбка"}
		})
		return res.status(500).json({})
	}
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT)) 