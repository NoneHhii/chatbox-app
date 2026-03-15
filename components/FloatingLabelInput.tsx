import React, { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";

interface props {
    label: string,
    value: string,
    onChangText: (value: string) => void,
    checkConfirmPass?: (value: string) => boolean,
    type: 'email' | 'name' | 'password' | 'confirmPassword'
}

const FloatingLabelInput = ({ label, value, onChangText, type, checkConfirmPass }: props) => {
    const moveText = useRef(new Animated.Value(value ? 1 : 0)).current;
    const [message, setMessage] = useState("");

    const focusHandle = () => {
        Animated.timing(moveText, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false
        }).start();
    }

    const blurHandle = () => {
        if (!value) {
            Animated.timing(moveText, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start();
            setMessage("Không được bỏ trống")
        }
    }

    const labelStyle = {
        top: moveText.interpolate({
            inputRange: [0, 1],
            outputRange: [12, -12]
        }),
        fontSize: moveText.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 14]
        }),
    }

    const checkRegex = (value: string) => {
        if (value === '') return '';

        let regex;
        let errorText = '';

        if (type === 'confirmPassword') {
            if (checkConfirmPass && !checkConfirmPass(value)) return "Mật khẩu không trùng khớp";
            return errorText;
        }

        switch (type) {
            case 'name':
                regex = /^[a-zA-ZÀ-ỹ\s]+$/;
                errorText = "Tên không hợp lệ";
                break;
            case 'email':
                regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
                errorText = "Email không hợp lệ";
                break;
            case 'password':
                regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                errorText = "Mật khẩu phải từ 8 ký tự, có chữ hoa, số và ký tự đặc biệt";
                break;
            default:
                return "";

        }
        // console.log(errorText);

        return regex.test(value) ? '' : errorText;
    }

    const changeText = (value: string) => {
        onChangText(value);
        const x = checkRegex(value);
        setMessage(x);

    }

    return (
        <View style={styles.input_box}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={changeText}
                onFocus={focusHandle}
                onBlur={blurHandle}
                secureTextEntry={type === 'password' || type === 'confirmPassword'}
            />
            <Animated.Text style={[styles.input_label, labelStyle]}>{label}</Animated.Text>
            <View style={{ width: '85%', alignItems: 'flex-end', marginTop: 5 }}>
                <Text
                    style={styles.text_err}
                >
                    {message}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    input_box: {
        position: 'relative',
        alignItems: 'center',
        marginVertical: 15,
    },

    input: {
        borderBottomWidth: 1,
        width: '85%',
        borderColor: '#CDD1D0',
        // paddingVertical: 10,
        // fontSize: 16
    },

    input_label: {
        color: '#797C7B',
        position: 'absolute',
        display: 'flex',
        top: '25%',
        left: '10%',
    },

    text_err: {
        textAlign: 'left',
        color: 'red',
        fontSize: 12,
    }
})

export default FloatingLabelInput;