/**
 * Imports
 */
import Vue from 'vue'
import App from './App'
import router from './router/router'
import Vuetify from 'vuetify'
import * as firebase from 'firebase'
import { store } from './vuex/store'
import AlertCmp from './components/shared/Alert'
import Moment from 'moment'
import jQuery from 'jquery'
import 'vuetify/dist/vuetify.min.css'
import './styles/custom.css'

/**
 * Global usages
 */
Vue.use(Vuetify, {
    theme: {
        primary: '#8e24aa',
        secondary: '#0288d1',
        accent: '#1de9b6',
        error: '#FF5252',
        info: '#0288d1',
        success: '#43A047',
        warning: '#ff6e40'
    }
})

window.Event = new Vue();
window.$ = jQuery

/**
 * Global components
 */
Vue.component('app-alert', AlertCmp)

/**
 * Production tips in console turned off
 */
Vue.config.productionTip = false

Vue.filter('date-format', function (date) {
    return Moment(date).format('MMMM Do YYYY')
})

/**
 * The global Vue instance
 */
new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App/>',
    created () {
        firebase.initializeApp({
            apiKey: 'AIzaSyBdOYlNz9Rdk1lDfbluFvIe-HostsmgyfU',
            authDomain: 'socialriders-2ad62.firebaseapp.com',
            databaseURL: 'https://socialriders-2ad62.firebaseio.com',
            projectId: 'socialriders-2ad62',
            storageBucket: 'socialriders-2ad62.appspot.com',
        })

        firebase.auth().onAuthStateChanged(authUser => {
            if (authUser) {
                this.$store.dispatch('autoSignIn', authUser)
            }
        });
    }
})