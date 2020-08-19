import React from 'react';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { firestore } from './plugins/firebase';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';
import crypto from 'crypto';
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));
class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      user: '',
      name: '',
      address: '',
      image: '',
      isSignedIn: false,
    }    
    this.getName = this.getName.bind(this);
    this.getAddress = this.getAddress.bind(this);
    this.getImage = this.getImage.bind(this);
    this.addData = this.addData.bind(this);
    }

  // Listen to the Firebase Auth state and set the local state.
  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
        (user) => this.setState({isSignedIn: !!user,user: user})
    );
  }
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  getName(event) {
    this.setState({
      name: event.target.value,
    });
  };

  getAddress(event) {
    this.setState({
      address: event.target.value,
    });
  };

  getImage(event){
    let image = event.target.files[0];
    this.setState({
      name: image.name,
      image: image,
    });
  }

  addData() {
    try {
      // 省略 
      // (Cloud Firestoreのインスタンスを初期化してdbにセット)
      let date = new Date();
      date.toString();
      let hashedName = crypto.createHash('md5').update(this.state.name + date.toString()).digest('hex');

      let userRef = firestore.collection('image').doc(hashedName)
      userRef.set({
        user: 'this.state.user',
        name: this.state.name,
        address: this.state.address,
        created_at: new Date(),
      })
      let storageRef = firebase.storage().ref().child(hashedName);
      storageRef.put(this.state.image)
      .then(function(snapshot) {
        alert("送信されました");
      });
    } catch (err) {
      console.log(`Error: ${JSON.stringify(err)}`)
    }
    
  }
  render(){
    const classes = useStyles();
    const uiConfig = {
      signInFlow: 'popup',
      signInSuccessUrl: '/',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: () => false
      }
    };
　　
    let successfulUser;

    if(this.state.isSignedIn){
      successfulUser=(
        <Box  m={2} p={1} color="palette.primary" textAlign="center">
          <form className={classes.root} noValidate autoComplete="off">
            <TextField  label="名前" 
            value= {this.state.name} 
            onChange={(event)=>{this.getName(event)}}/> 


            <TextareaAutosize 
            aria-label="住所" 
            rowsMax={4} 
            placeholder="住所" 
            value= {this.state.address} 
            onChange={(event)=>{this.getAddress(event)}}
            />


            <input type = "file" 
            onChange={(event)=>{this.getImage(event)}}>
            </input>


            <TextField  label="isSignedIn" 
            value= {this.state.isSignedIn}/> 

            <TextField  label="user" 
            value= {this.state.user}/> 
    
            <Button variant="contained"  color="primary" onClick={this.addData}>upload</Button>
          </form>
          <Button variant="contained" onClick={() => firebase.auth().signOut()}>logout</Button> 
        </Box>

      );
     }else{
      successfulUser=(
        <Box component="div" display="inline">
         <p>Please sign-in:</p>
         <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
         </Box>
       );
      }   

     return(
       <div>
          {successfulUser}   
       </div>
      );
    }
}
export default App;