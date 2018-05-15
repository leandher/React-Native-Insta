/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  ScrollView,
  FlatList
} from 'react-native';
import Post from './src/components/Post';

const width = Dimensions.get('screen').width;

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      fotos: []
    }
  }

  componentDidMount() {
    fetch('https://instalura-api.herokuapp.com/api/public/fotos/rafael')
      .then(resposta => resposta.json())
      .then(json => this.setState({ fotos: json }));
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
    const foto = this.buscaPorId(idFoto);

    let novaLista = []
    if (!foto.likeada) {
      novaLista = [
        ...foto.likers,
        { login: 'meuUsuario' }
      ]
    } else {
      novaLista = foto.likers.filter(liker => {
        return liker.login !== 'meuUsuario'
      })
    }

    const fotoAtualizada = {
      ...foto,
      likeada: !foto.likeada,
      likers: novaLista
    }
    this.atualizaFotos(fotoAtualizada);
  }

  adicionaComentario(idFoto, valorComentario, inputComentario) {
    if (valorComentario === '')
      return;

    const foto = this.buscaPorId(idFoto);

    const novaLista = [
      ...foto.comentarios,
      {
        id: valorComentario,
        login: 'meuUsuario',
        texto: valorComentario
      }
    ];

    const fotoAtualizada = {
      ...foto,
      comentarios: novaLista
    }

    this.atualizaFotos(fotoAtualizada);
    inputComentario.clear();
  }

  render() {
    return (
      <FlatList style={styles.container}
        data={this.state.fotos}
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

const styles = StyleSheet.create({
  container: {
    marginTop: 20
  }
});
