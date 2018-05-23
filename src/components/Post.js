import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TextInput
} from 'react-native';
import InputComentario from './InputComentario';
import Likes from './Likes';

const width = Dimensions.get('screen').width;

export default class Post extends Component {

  exibeLegenda(foto) {
    if (foto.comentario == '')
      return;

    return (
      <View style={styles.comentario}>
        <Text style={styles.tituloComentario}>{foto.loginUsuario}</Text>
        <Text>{foto.comentario}</Text>
      </View>
    );
  }

  render() {
    const { foto, likeCallback, comentarioCallback, verPerfilCallback } = this.props;
    return (
      <View>
        <TouchableOpacity style={styles.cabecalho}
          onPress={() => verPerfilCallback(foto.id)}>
          <Image source={{ uri: foto.urlPerfil }} style={styles.fotoDePerfil} />
          <Text>{foto.loginUsuario}</Text>
        </TouchableOpacity>
        <Image source={{ uri: foto.urlFoto }} style={styles.foto} />
        <View style={styles.rodape}>
          <Likes likeCallback={likeCallback} foto={foto} />

          {this.exibeLegenda(foto)}

          <FlatList
            data={foto.comentarios}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) =>
              <View style={styles.comentario}>
                <Text style={styles.tituloComentario}>{item.login}</Text>
                <Text>{item.texto}</Text>
              </View>
            } />

          <InputComentario idFoto={foto.id}
            comentarioCallback={comentarioCallback} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cabecalho: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fotoDePerfil: {
    margin: 10,
    borderRadius: 20,
    width: 40, height: 40
  },
  foto: {
    width: width,
    height: width
  },
  rodape: {
    margin: 10
  },
  comentario: {
    flexDirection: 'row'
  },
  tituloComentario: {
    fontWeight: 'bold',
    marginRight: 5
  }
})