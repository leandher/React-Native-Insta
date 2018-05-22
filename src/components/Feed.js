import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    FlatList,
    AsyncStorage
} from 'react-native';
import Post from './Post';
import InstaFetchService from '../services/InstaFetchService';
import Notificacao from '../api/Notificacao';

const width = Dimensions.get('screen').width;

export default class Feed extends Component {

    constructor() {
        super();
        this.state = {
            fotos: []
        }
    }

    componentDidMount() {
        InstaFetchService.get('/fotos')
            .then(json => this.setState({ fotos: json }));
    }

    logout() {
        AsyncStorage.removeItem('usuario');
        AsyncStorage.removeItem('token');

        this.props.navigator.resetTo({
            screen: {
                screen: 'Login',
                title: 'Login'
            }
        });
    }

    buscaPorId(idFoto) {
        return this.state.fotos
            .find(foto => foto.id === idFoto)
    }

    atualizaFotos(fotoAtualizada) {
        const fotos = this.state.fotos.map(foto =>
            foto.id === fotoAtualizada.id ? fotoAtualizada : foto);
        this.setState({ fotos });
    }

    like(idFoto) {
        const listaOriginal = this.state.fotos;
        const foto = this.buscaPorId(idFoto);

        AsyncStorage.getItem('usuario')
            .then(usuarioLogado => {

                let novaLista = [];
                if (!foto.likeada) {
                    novaLista = [
                        ...foto.likers,
                        { login: usuarioLogado }
                    ];
                } else {
                    novaLista = foto.likers.filter(liker => {
                        return liker.login !== usuarioLogado
                    });
                }

                return novaLista;
            })
            .then(novaLista => {
                const fotoAtualizada = {
                    ...foto,
                    likeada: !foto.likeada,
                    likers: novaLista
                };

                this.atualizaFotos(fotoAtualizada);
            });
            
            InstaFetchService.post(`/fotos/${idFoto}/like`)
            .catch(e => {
                this.setState({fotos: listaOriginal})
                Notificacao.exibe('Ops...', 'Algo de errado não está certo!');
              });
    }

    adicionaComentario(idFoto, valorComentario, inputComentario) {
        if (valorComentario === '')
            return;
        const listaOriginal = this.state.fotos;
        const foto = this.buscaPorId(idFoto);
        const comentario = { 
            texto: valorComentario
          };

        InstaFetchService.post(`/fotos/${idFoto}/comment`, comentario)
            .then(comentario => [...foto.comentarios, comentario])
            .then(novaLista => {
                const fotoAtualizada = {
                    ...foto,
                    comentarios: novaLista
                }

                this.atualizaFotos(fotoAtualizada);
                inputComentario.clear();
            })
            .catch(e => {
                this.setState({fotos: listaOriginal})
                Notificacao.exibe('Ops...', 'Algo de errado não está certo!');
              });


    }

    render() {
        return (
            <FlatList data={this.state.fotos}
                keyExtractor={item => String(item.id)}
                renderItem={({ item }) =>
                    <Post foto={item}
                        likeCallback={this.like.bind(this)}
                        comentarioCallback={this.adicionaComentario.bind(this)} />
                }
            />
        );
    }
}