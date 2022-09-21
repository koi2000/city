// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })
module.exports = {
  devServer:{
    proxy:{
      "/apicity":{
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          "^/apicity":"",
        }
      }
    }
  }
}