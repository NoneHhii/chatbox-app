import { Image, StyleSheet, View } from "react-native"

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Image source={require("../assets/images/logo.png")} style={{ width: 100, height: 100 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#228B22'
    }
})

export default SplashScreen;