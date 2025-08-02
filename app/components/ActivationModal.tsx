import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivationService,
  Resolution,
  VideoDetails,
} from "../api/ActivationService";
import { downloadManager } from "../services/DownloadManager";

const ActivationModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<string | null>(
    null
  );

  const handleCheckCode = async () => {
    if (!code) {
      setError("Please enter a code.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResolutions([]);
    setSelectedResolution(null);

    const response = await ActivationService.checkActivationCode(code);
    if ("resolutions" in response) {
      setResolutions(response.resolutions);
      setVideo(response.video);
    } else {
      setError(response.message);
    }

    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!selectedResolution) {
      setError("Please select a resolution.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const response = await ActivationService.requestDownloadLinks(
      code,
      selectedResolution
    );

    if ("url" in response) {
      // TODO: Integrate with the actual Download Manager
      downloadManager.enqueueDownload(
        String(response.video_id),
        response.video_title,
        code,
        {
          videoUrl: response.url,
          audioUrl: response.audio_url,
          subtitleUrl: response.subtitle_url,
        }
      );

      Alert.alert(
        "Download Queued",
        `Your download for "${response.video_title}" has been added to the queue.`
      );
      handleClose(); // Use handleClose to reset state and close
    } else {
      setError(response.message);
    }
    setIsLoading(false);
  };

  // Reset state when modal is closed
  const handleClose = () => {
    setCode("");
    setIsLoading(false);
    setError(null);
    setResolutions([]);
    setSelectedResolution(null);
    onClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    const strage = "http://192.168.1.15:8000/storage/";
    if (resolutions.length > 0 && video) {
      return (
        <View style={{ width: "100%", alignItems: "center" }}>
          <Image
            source={{ uri: strage + video.thumbnail }}
            style={[styles.thumbnail, { width: 70, height: 70 }]}
          />
          <Text style={styles.title}>{video.title}</Text>
          <Image
            source={{ uri: strage + video.teacher_image }}
            style={[
              styles.teacher_image,
              { width: 50, height: 50, borderRadius: 50 },
            ]}
          />
          <Text style={styles.title}>{video.teacher_name}</Text>
          <Text style={styles.title}>Select Resolution</Text>

          <View
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: 10,
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            {resolutions.map((res) => (
              <TouchableOpacity
                key={res.quality}
                style={[
                  styles.resolutionButton,

                  selectedResolution === res.quality &&
                    styles.resolutionButtonSelected,
                ]}
                onPress={() => setSelectedResolution(res.quality)}
              >
                <Text style={styles.resolutionText}>{res.quality}</Text>
                <Text style={styles.resolutionText}>{res.size_in_mb} MB</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              !selectedResolution && styles.buttonDisabled,
            ]}
            onPress={handleDownload}
            disabled={!selectedResolution}
          >
            <Text style={styles.buttonText}>Start Download</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.title}>Enter Activation Code</Text>
        <TextInput
          style={styles.input}
          placeholder="code senstive for leter case"
          value={code}
          onChangeText={setCode}
        />
        <TouchableOpacity style={styles.button} onPress={handleCheckCode}>
          <Text style={styles.buttonText}>Check Code</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.qrButton}>
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {renderContent()}
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={handleClose}
          >
            <Text style={styles.textStyle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
  },
  thumbnail: {
    marginBottom: 10,
  },
  teacher_image: {
    marginBottom: 10,
  },
  title: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 18,
  },
  button: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    backgroundColor: "#2196F3",
    width: "100%",
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  qrButton: {
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    backgroundColor: "#5a5a5a",
    width: "100%",
    marginBottom: 10,
  },
  buttonClose: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  resolutionButton: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    width: "48%",
  },
  resolutionButtonSelected: {
    backgroundColor: "#e0f7fa",
    borderColor: "#00bcd4",
  },
  resolutionText: {
    textAlign: "center",
    fontSize: 16,
  },
});

export default ActivationModal;
