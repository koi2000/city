import Vue from 'vue'
import App from './App.vue'
import i18n from "./i18n/index";
import "element-ui/lib/theme-chalk/index.css";

import ElementUI from "element-ui"
import router from "./router"

Vue.config.productionTip = false
Vue.use(ElementUI)

let mainVue = new Vue({
    i18n,
    router,
    render: function (h) {
        return h(App)
    }
}).$mount("#app");
//createApp(App).mount('#app')
export default mainVue