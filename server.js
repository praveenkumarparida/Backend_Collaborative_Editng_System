const mongoose = require("mongoose")
const Document = require("./Document")

mongoose.connect("mongodb+srv://root:root@cluster0.6skciju.mongodb.net/"
  // useNewUrlParser: true,
  // useUnifiedTopology: true,

)
console.log('connected');

const io = require("socket.io")("https://backend-collaborative-editng-system.onrender.com", {
  cors: {
    origin: "https://ps-docs-clone.netlify.app/",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
