export default {
    state: {
        explores: null,
    },

    getters: {
        explores (state) {
            return state.explores
        },
    },

    mutations: {
        setExplores (state, explores) {
            state.explores = explores
        },
    },

    actions: {
        getExplores ({commit}) {
            commit('setLoading', true)

            return new Promise((resolve, reject) => {
                db.collection('/explores')
                    .where('date', '>', new Date())
                    .onSnapshot((querySnapshot) => {
                        commit('setLoading', false)

                        const explores = []

                        querySnapshot.forEach(function (doc) {
                            let explore = doc.data()
                            explore.id = doc.id

                            explores.push(explore)
                        });

                        commit('setExplores', explores)
                        resolve(explores)
                    }, error => {
                        commit('setLoading', false)
                        commit('clearMessage')
                        commit('setMessage', {
                            text: error.message, type: 'error'
                        })
                        reject()
                    })
            })
        },
        getExploresByUser({commit}, uid) {
            commit('setLoading', true)

            return new Promise ((resolve, reject) => {
                db.collection('/explores')
                    .where('date', '>', new Date())
                    .where('owner.uid', '==', uid)
                    .onSnapshot((querySnapshot) => {
                        commit('setLoading', false)

                        const explores = []

                        querySnapshot.forEach(function(doc) {
                            let explore = doc.data()
                            explore.id = doc.id

                            explores.push(explore)
                        });

                        resolve(explores)
                    }, error => {
                        commit('setLoading', false)
                        commit('clearMessage')
                        reject(error.message)
                    })
            })
        },
        organizeExplore({commit}, explore) {
            commit('setLoading', true)

            return new Promise((resolve, reject) => {
                db.collection('/explores')
                    .add(explore)
                    .then(docRef => {
                        commit('setLoading', false)
                        commit('clearMessage')
                        resolve(docRef);
                }, error => {
                    commit('clearMessage')
                    reject(error)
                })
            })
        },
        joinExplore({commit}, payload) {
            let docRef = firebase.firestore().collection('explores').doc(payload.id)
            commit('setLoading', true)
            commit('clearMessage')

            return new Promise((resolve, reject) => {
                db.runTransaction(function (transaction) {
                    // This code may get re-run multiple times if there are conflicts.
                    return transaction
                        .get(docRef)
                        .then(function (doc) {
                            commit('setLoading', false)

                            if (!doc.exists) {
                                reject('Explore does not exists')
                            }

                            let riders = doc.data().riders
                            riders.push(payload.user)

                            transaction.update(docRef, {riders: riders})
                        });
                }).then(function () {
                    resolve('Joined Explore!')
                }).catch(function (error) {
                    reject('Failed to Join Explore: ' + error)

                })
            })
        },
        leaveExplore({commit}, payload) {
            let docRef = firebase.firestore().collection('explores').doc(payload.id)
            commit('setLoading', true)
            commit('clearMessage')

            return new Promise((resolve, reject) => {
                db.runTransaction(function (transaction) {
                    // This code may get re-run multiple times if there are conflicts.
                    return transaction
                        .get(docRef)
                        .then(function (doc) {
                            commit('setLoading', false)

                            if (!doc.exists) {
                                reject('Explore does not exists')
                            }

                            let riders = doc.data().riders
                            riders = riders.filter(rider => {
                                return rider.uid !== payload.uid
                            })

                            transaction.update(docRef, {riders: riders})
                        });
                }).then(function () {
                    resolve('Left Explore!')
                }).catch(function (error) {
                    reject('Failed to LEave Explore: ' + error)

                })
            })
        }
    }
}