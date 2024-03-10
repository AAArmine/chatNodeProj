const path = require('path')
const express = require("express");
const app = express();
//set static folder
app.use(express.static(path.join(__dirname, "public")))
const PORT = process.env.PORT || 3000;
console.log(path.join(__dirname, "public"));
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
