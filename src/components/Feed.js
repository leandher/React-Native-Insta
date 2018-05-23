import React, { Component } from 'react';
import {
    StyleSheet,
    ScrollView,
    Dimensions,
    FlatList,
    AsyncStorage
} from 'react-native';
import Post from './Post';
import InstaFetchService from '../services/InstaFetchService';
import Notificacao from '../api/Notificacao';
import HeaderUsuario from './HeaderUsuario';

const width = Dimensions.get('screen').width;

export default class Feed extends Component {

    constructor() {
        super();
        this.state = {
            fotos: []
        }
    }

    componentDidMount() {
        this.props.navigator.setOnNavigatorEvent(evento => {
            if (evento.id === 'willAppear')
                this.load();
        });
    }

    load() {
        let uri = "/fotos";
        if (this.props.usuario)
            uri = `/public/fotos/${this.props.usuario}`


        InstaFetchService.get(uri)
            .then(json => this.setState({ fotos: json, status: 'NORMAL' }))
            .catch(e => this.setState({ status: 'FALHA_CARREGAMENTO' }));
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
                this.setState({ fotos: listaOriginal })
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
                this.setState({ fotos: listaOriginal })
                Notificacao.exibe('Ops...', 'Algo de errado não está certo!');
            });


    }

    verPerfilUsuario(idFoto) {
        const foto = this.buscaPorId(idFoto);

        this.props.navigator.push({
            screen: 'PerfilUsuario',
            backButtonTitle: '',
            title: foto.loginUsuario,
            passProps: {
                usuario: foto.loginUsuario,
                fotoDePerfil: foto.urlPerfil,
                posts: this.state.fotos.length
            }
        })
    }

    exibeHeader() {
        if (this.props.usuario)
            return <HeaderUsuario {...this.props} posts={this.state.fotos.length} />;
    }

    render() {
        return (
            <ScrollView>
                {this.exibeHeader()}
                <FlatList data={this.state.fotos}
                    keyExtractor={item => String(item.id)}
                    renderItem={({ item }) =>
                        <Post foto={item}
                            likeCallback={this.like.bind(this)}
                            comentarioCallback={this.adicionaComentario.bind(this)}
                            verPerfilCallback={this.verPerfilUsuario.bind(this)} />
                    }
                />
            </ScrollView>
        );
    }
}