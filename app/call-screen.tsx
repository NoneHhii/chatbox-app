import { socket } from "@/socket/config";
import { peerConstraints } from '@/utils/webrtc';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RTCPeerConnection, RTCSessionDescription, RTCView, mediaDevices } from 'react-native-webrtc';

const SIGNAL_TYPES = {
    offer: "webrtc:offer",
    answer: "webrtc:answer",
    iceCandidate: "webrtc:ice-candidate",
};

const CallScreen = () => {
    const params = useLocalSearchParams();
    const [localStream, setLocalStream] = useState<any>(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const pc = useRef<RTCPeerConnection>(new RTCPeerConnection(peerConstraints));

    const handleHangup = () => {
        // 1. Gửi tín hiệu báo cho đối phương là mình đã cúp máy
        socket.emit("end_call", {
            conversationId: params.id // ID phòng chat đang gọi
        });

        // 2. Gọi hàm dọn dẹp tài nguyên cục bộ
        handleHangupLocal();
    };

    const handleHangupLocal = () => {
        // 1. Tắt tất cả luồng Camera và Micro
        if (localStream) {
            localStream.getTracks().forEach((track: any) => track.stop());
        }

        // 2. Đóng kết nối WebRTC
        if (pc.current) {
            pc.current.close();
        }

        // 3. Reset các state về null
        setLocalStream(null);
        setRemoteStream(null);

        // 4. Thoát khỏi màn hình cuộc gọi, quay về phòng chat
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/chat-room");
        }
    };

    // useEffect(() => {
    //     setupWebRTC();

    //     // Lắng nghe Answer từ Web gửi về
    //     socket.on(SIGNAL_TYPES.answer, async (data) => {
    //         await pc.current.setRemoteDescription(new RTCSessionDescription(data.signal));
    //     });

    //     // Lắng nghe ICE từ Web gửi về
    //     socket.on(SIGNAL_TYPES.iceCandidate, async (data) => {
    //         if (data.candidate) {
    //             await pc.current.addIceCandidate(data.candidate);
    //         }
    //     });

    //     return () => {
    //         socket.off(SIGNAL_TYPES.answer);
    //         socket.off(SIGNAL_TYPES.iceCandidate);
    //         // ... cleanup
    //     };
    // }, []);

    // const setupWebRTC = async () => {
    //     // 1. Lấy mic/cam
    //     const stream = await mediaDevices.getUserMedia({
    //         audio: true,
    //         video: params.isVideo === "true"
    //     });
    //     setLocalStream(stream);
    //     stream.getTracks().forEach(track => pc.current.addTrack(track, stream));

    //     (pc.current as any).onicecandidate = (event) => {
    //         if (event.candidate) {
    //             socket.emit(SIGNAL_TYPES.iceCandidate, {
    //                 to: params.targetUserId, // Web dùng key "to"
    //                 candidate: event.candidate
    //             });
    //         }
    //     };

    //     // 2. Khi có luồng video từ đối phương gửi về
    //     (pc.current as any).onaddstream = (event: any) => {
    //         setRemoteStream(event.stream);
    //     };

    //     // Hoặc với addEventListener
    //     (pc.current as any).addEventListener('addstream', (event: any) => {
    //         setRemoteStream(event.stream);
    //     });

    //     // 3. Nếu mình là người gọi, tạo Offer
    //     if (params.mode === "outgoing") {
    //         const offer = await pc.current.createOffer();
    //         await pc.current.setLocalDescription(offer);

    //         socket.emit(SIGNAL_TYPES.offer, {
    //             to: params.targetUserId,
    //             signal: offer, // Web dùng key "signal" thay vì signalData
    //             isVideo: params.isVideo === "true"
    //         });
    //     }
    // };

    return (
        <View style={styles.container}>
            {/* Remote Video (Đối phương) */}
            {remoteStream ? (
                <RTCView streamURL={remoteStream.toURL()} style={styles.remoteVideo} objectFit="cover" />
            ) : (
                <View style={styles.userInfo}>
                    <Image
                        source={params.userAvatar ? { uri: params.userAvatar as string } : avatarDefault}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                    <Text style={styles.userName}>{params.userName}</Text>
                    <Text style={styles.callingText}>Đang kết nối...</Text>
                </View>
            )}

            {/* Local Video (Mình) */}
            {localStream && params.isVideo === "true" && (
                <RTCView streamURL={localStream.toURL()} style={styles.localVideo} objectFit="cover" />
            )}

            {/* Bảng điều khiển */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.iconCircle} onPress={() => {/* Logic tắt mic */ }}>
                    <Ionicons name="mic-outline" size={28} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleHangup} style={styles.hangupBtn}>
                    <MaterialCommunityIcons name="phone-hangup" size={35} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconCircle} onPress={() => {/* Logic đổi camera */ }}>
                    <Ionicons name="camera-reverse-outline" size={28} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A', // Nền tối cho chuyên nghiệp
    },
    // Video của đối phương (Toàn màn hình)
    remoteVideo: {
        flex: 1,
        backgroundColor: '#000',
    },
    // Video của mình (Nhỏ, nằm ở góc trên bên phải)
    localVideo: {
        width: 120,
        height: 180,
        position: 'absolute',
        top: 50,
        right: 20,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#24786D',
        backgroundColor: '#333',
        zIndex: 10,
    },
    // Thanh điều khiển bên dưới
    controls: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    // Nút chức năng chung
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Nút gác máy (Màu đỏ)
    hangupBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    // Thông tin người đang gọi
    userInfo: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginTop: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    callingText: {
        fontSize: 16,
        color: '#ccc',
        marginTop: 5,
    }
});

export default CallScreen;