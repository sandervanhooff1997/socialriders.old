import firebase from 'firebase'
import firestore from 'firebase/firestore'

export default {
    signIn ({commit, dispatch}, providedProvider) {
        commit('setLoading', true)

        var provider;

        if (providedProvider === 'google') {
            provider = new firebase.auth.GoogleAuthProvider();
        } else if (providedProvider === 'facebook') {
            provider = new firebase.auth.FacebookAuthProvider();
        } else {
            return
        }

        firebase.auth().signInWithPopup(provider).then(function (result) {
            commit('setLoading', false)
            commit('clearMessage')

            // This gives you a Google Access Token. You can use it to access the Google API.
            const token = result.credential.accessToken

            const user = {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.displayName,
                photoUrl: result.user.photoURL
            }

            dispatch('registerIfNewUser', user)
            commit('setUser', user)
        }).catch(function (error) {
            commit('setLoading', false)
            commit('setMessage', {text:error.message, type: 'error'})
        });
    },
    registerIfNewUser({commit}, user) {
        commit('setLoading', true)
        commit('clearMessage')

        firebase.firestore()
            .collection('users')
            .where("uid", "==", user.uid)
            .get()
            .then((docRef) => {
                // Did not found a existing user matching this uid
                if (docRef.empty) {
                    firestore()
                        .collection('users')
                        .add(user)
                        .then((docRef) => {
                            commit('setLoading', false)
                            console.log('New user added to firestore!')
                        })
                        .catch((error) => {
                            commit('setMessage', {text: error.message, type: 'error'})
                        })
                }
            })
            .catch((error) => {
                commit('setMessage', {text: error.message, type: 'error'})
            })
    },
    autoSignIn ({commit}, user) {
        commit('setUser', {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            photoUrl: user.photoURL
        })
    },
    logout ({commit}) {
        firebase.auth().signOut()
        commit('setUser', null)
    },
    getExplores ({commit}) {
        firebase.firestore()
            .collection('/explores')
            .where('date', '>', new Date())
            .onSnapshot((querySnapshot) => {
                const explores = []

                querySnapshot.forEach(function(doc) {
                    explores.push(doc.data())
                });

                commit('setExplores', explores)
            }, (error) => {
                commit('clearMessage')
                commit('setMessage', {text:error.message, type: 'error'
                })
            })
    },
    organizeExplore({commit}, explore) {
        return new Promise((resolve, reject) => {
            commit('setLoading', true)
            firebase.firestore().collection('/explores').add(explore).then(docRef => {
                commit('setLoading', false)
                commit('clearMessage')
                resolve(docRef);  // Let the calling function know that http is done. You may send some data back
            }, error => {
                commit('clearMessage')
                reject(error)
            })
        })
    },
    getExperiences({commit}) {
        firebase.firestore()
            .collection('/explores')
            .where('date', '<', new Date())
            .orderBy('date', 'desc')
            .onSnapshot((querySnapshot) => {
                const experiences = []

                querySnapshot.forEach(function(doc) {
                    experiences.push(doc.data())
                });

                commit('setExperiences', experiences)
            }, (error) => {
                commit('clearMessage')
                commit('setMessage', {text:error.message, type: 'error'
                })
            })
    },
    getExperience({commit}, id) {
        return new Promise((resolve, reject) => {
            commit('setLoading', true)
            firebase.firestore().collection('/explores')
                .where(firebase.firestore.FieldPath.documentId(), "==", id)
                .limit(1)
                .get()
                .then(querySnapshot => {
                    commit('setLoading', false)
                    commit('clearMessage')
                    querySnapshot.forEach(function(doc) {
                        resolve(doc.data());
                    });

            }, error => {
                commit('clearMessage')
                reject(error)
            })
        })
    },
    errorMessage ({commit}, text) {
        commit('clearMessage')
        commit('setMessage', {type: 'error', text: text})
    },
    successMessage ({commit}, text) {
        commit('clearMessage')
        commit('setMessage', {type: 'success', text: text})
    },
    clearMessage ({commit}) {
        commit('clearMessage')
    }
}