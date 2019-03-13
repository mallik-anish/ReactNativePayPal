
import React from "react";
import { View, Image,SafeAreaView,Dimensions,TextInput,TouchableOpacity,Text ,WebView,Alert,ActivityIndicator,Modal } from "react-native";
import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings(['WebView'])
export default class App extends React.Component {
    state = {
        accessToken: null,
        approvalUrl: null,
        paymentId: null,
        showModal:false,
        textPrice: ''
    }
   
    componentDidMount(){

    }
    payClick(){
        
        if(this.state.textPrice!="" && this.state.textPrice!="0"){
          this.setState({
            showModal : true
        })
          let payPrice={
            "intent": "sale",
            "redirect_urls": {
              "return_url": "https://example.com/your_redirect_url.html",
              "cancel_url": "https://example.com/your_cancel_url.html"
            },
            "payer": {
              "payment_method": "paypal"
            },
            "transactions": [
              {
                "amount": {
                  "total": this.state.textPrice,
                  "currency": "USD",
                  "details": {
                    "subtotal": this.state.textPrice,
                    "tax": "0",
                    "shipping": "0",
                    "handling_fee": "0",
                    "insurance": "0",
                    "shipping_discount": "0"
                  }
                }
              }
            ]
          }

        fetch("https://api.sandbox.paypal.com/v1/oauth2/token", {
            body: "grant_type=client_credentials",
            headers: {
              Accept: "application/json",
              Authorization: "Basic <Authorization Key>",
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
          }).then((response)=>response.json()).then((responseData)=>{
          //  Alert.alert(JSON.stringify(responseData.access_token))
           this.setState({
            accessToken: responseData.access_token
            })
            fetch("https://api.sandbox.paypal.com/v1/payments/payment", {
                    body: JSON.stringify(payPrice),
                    headers: {
                        Authorization: "Bearer "+responseData.access_token,
                        "Content-Type": "application/json"
                    },
                    method: "POST"
                    }).then((response)=>response.json()).then((responseData)=>{
                    // Alert.alert(JSON.stringify(responseData))
                        const { id, links } = responseData
                        const approvalUrl = links.find(data => data.rel == "approval_url")
                       // Alert.alert(approvalUrl.href)
                        this.setState({
                            paymentId: id,
                            approvalUrl: approvalUrl.href
                        })
                    })
        })
      }else{
        Alert.alert("Please Enter Amount")
      }
    }

    _onNavigationStateChange = (webViewState) => {

        if (webViewState.url.includes('https://example.com/your_redirect_url.html')) {
            this.setState({
                showModal : false,
                approvalUrl: null
            })
           
          //  Alert.alert(JSON.stringify(webViewState))
            //const { PayerID, paymentId } = webViewState.url
            var PayerID = ""
            var paymentId = ""
            var regex = /[?&]([^=#]+)=([^&#]*)/g,
                    params = {},
                    match;
            while (match = regex.exec(webViewState.url)) {
                    params[match[1]] = match[2];

                    }
            PayerID = params.PayerID
            paymentId = params.paymentId   
           // Alert.alert(PayerID + paymentId)
            let url = "https://api.sandbox.paypal.com/v1/payments/payment/"+paymentId+"/execute"
            let body = {
                payer_id : PayerID
              }
            fetch(url, {
                body: JSON.stringify(body),
                headers: {
                  Accept: "application/json",
                  Authorization: "Bearer " + this.state.accessToken,
                  "Content-Type": "application/json"
                },
                method: "POST"
              }).then((response)=>response.json()).then((responseData)=>{
           //  Alert.alert(JSON.stringify(responseData))
            Alert.alert("Payment done Successfully")

              this.setState({
                showModal : false,
                approvalUrl: null
            })
            })

        }else if(webViewState.url.includes('https://example.com/your_cancel_url.html')){
          this.setState({
            showModal : false,
            approvalUrl: null
        })
        Alert.alert("Payment failed!Please try again")
        }
    }
    render() {
        
           if(this.state.showModal == false){
            return(
                
                <View style={{flex:1,backgroundColor:'white'}}>
                <SafeAreaView>
                    
                        <View style={{width : Dimensions.get('window').width,height:400}}>
                        <TextInput
                              style={{height: 40,width:300,alignSelf:'center', borderColor: 'gray', borderWidth: 1}}
                              onChangeText={(textPrice) => this.setState({textPrice})}
                              value={this.state.textPrice}
                              keyboardType="numeric"
                            />
                            <TouchableOpacity
                            style={{width : Dimensions.get('window').width,justifyContent:'center'}}
                            onPress={()=> this.payClick(true)}
                            >
                                <Image source={require('./image/paypalicon.png')}
                                style={{alignSelf:'center'}}
                                />
                            </TouchableOpacity>
                           
                        </View>
                        
                    </SafeAreaView>
                </View>
            )

        }else{
            return(
            <View style={{flex:1,backgroundColor:'white'}}>
            <SafeAreaView>
            <View style={{width : Dimensions.get('window').width,height:Dimensions.get('window').height}}>
            {
                this.state.approvalUrl ? <WebView
                style={{  marginTop: 20,
                    
                    }}
                    source={{ uri: this.state.approvalUrl }}
                    onNavigationStateChange={this._onNavigationStateChange}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    
                    
                /> : <ActivityIndicator size="large" color="#0000ff" />
            }
            </View>
            </SafeAreaView>
           
        </View>
            )
        }
    }
}
