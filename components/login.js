import {useFormik} from 'formik';
import {StyleSheet, Text, TextInput, View, Image, TouchableOpacity, Alert} from 'react-native';
import * as Yup from 'yup';
import React, {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-community/google-signin';

const Login = () => {
  const [user, setUser] = useState();

  const onAuthStateChanged = (user) => {
    setUser(user);
    console.log(user);
  };

  useEffect(() => {
    return auth().onAuthStateChanged(onAuthStateChanged);
  }, []);

  const signInWithEmail = (email, pass) => {
    auth()
      .createUserWithEmailAndPassword(email, pass)
      .then((user) => {
        console.log(user);
        return Alert.alert('Success', 'User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          return Alert.alert('Error', 'That email address is already in use!');
        }
        console.error(error.code);
      });
  };

  const signInWithFacebook = async () => {
    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

    if (result.isCancelled) {
      return Alert.alert('Error', 'Login process cancelled');
    }

    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      return Alert.alert('Error', 'Something went wrong');
    }

    const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

    auth().signInWithCredential(facebookCredential)
      .then((user) => {
        return Alert.alert('Success', `Welcome facebook user, ${user.user.displayName}`);
      });
  };

  const signInWithGoogle = async () => {
    GoogleSignin.configure({
      webClientId: '636257647143-2psunbfkpmsavf0i9kou6q0mf9918ree.apps.googleusercontent.com',
    });

    const {idToken} = await GoogleSignin.signIn();

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    auth().signInWithCredential(googleCredential)
      .then((user) => {
        return Alert.alert('Success', `Welcome Google user, ${user.user.displayName}`);
      })
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      pass: '',
    },
    validationSchema: Yup.object({
      email: Yup
        .string()
        .email('Invalid email')
        .required('Email required'),
      pass: Yup
        .string()
        .min(6, 'Password is very weak')
        .required('Password required'),
    }),
    onSubmit: res => signInWithEmail(res.email, res.pass),
  });

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={{uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSaYEDLX5fpwM9F1YS8RO8CKPq04nDmQS9gVA&usqp=CAU'}}/>

      <TextInput
        onChangeText={formik.handleChange('email')}
        onBlur={formik.handleBlur('email')}
        value={formik.values.email} placeholder='Email' style={styles.input}/>

      {formik.errors.email && formik.touched.email ? <Text style={styles.error}>{formik.errors.email}</Text> : null}

      <TextInput
        onChangeText={formik.handleChange('pass')}
        onBlur={formik.handleBlur('pass')}
        value={formik.values.pass} placeholder='Password' style={styles.input}/>

      {formik.errors.pass && formik.touched.pass ? <Text style={styles.error}>{formik.errors.pass}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={formik.handleSubmit}><Text style={styles.buttonText}>Submit</Text></TouchableOpacity>

      <View style={styles.social}>
        <TouchableOpacity
          onPress={signInWithFacebook}>
          <Image style={styles.socialBtn}
                 source={{uri: 'https://icons-for-free.com/iconfiles/png/512/color+facebook+icon-1320168272811213233.png'}}/>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={signInWithGoogle}>
          <Image style={styles.socialBtn}
                 source={{uri: 'https://img.icons8.com/color/452/google-logo.png'}}/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  social: {
    marginTop: 50,
    width: 200,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialBtn: {
    width: 60,
    height: 60,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 22,
  },
  logo: {
    height: 100,
    width: 100,
    marginBottom: 20,
  },
  input: {
    marginTop: 20,
    height: 50,
    width: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  button: {
    marginTop: 50,
    height: 35,
    borderRadius: 5,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2980b9',
  },
  buttonText: {
    color: 'white',
  },
  error: {
    alignSelf: 'flex-start',
    color: '#e74c3c',
  },
});

export default Login;
