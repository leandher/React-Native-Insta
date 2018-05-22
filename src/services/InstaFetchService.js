import { AsyncStorage } from 'react-native'

const retornaPossivelJson = (resposta) => {
    if(resposta.ok)
      return resposta.json();
  
    throw new Error('Não foi possível completar a operação');
  };

  const baseUri = 'https://instalura-api.herokuapp.com/api/';

export default class InstaFetchService {
    static get(recurso) {
        const uri = baseUri + recurso;

        return AsyncStorage.getItem('token')
            .then(token => {
                return {
                    headers: new Headers({
                        "X-AUTH-TOKEN": token
                    })
                }

            })
            .then(requestInfo => fetch(uri, requestInfo))
            .then(resposta => retornaPossivelJson(resposta));
    }

    static post(recurso, dados) {
        const uri = baseUri + recurso;

        return AsyncStorage.getItem('token')
            .then(token => {
                return {
                    method: 'POST',
                    body: JSON.stringify(dados),
                    headers: new Headers({
                        "Content-type": "application/json",
                        "X-AUTH-TOKEN": token
                    })
                };
            })
            .then(requestInfo => fetch(uri, requestInfo))
            .then(resposta => retornaPossivelJson(resposta));
    }
}