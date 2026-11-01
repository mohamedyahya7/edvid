import { Grade, GradeService } from "@/api/GradeService";
import { ThemedText } from "@/components/ui/ThemedText";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Link, Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axiosInstance from "../../api/Axios";

const FirstLetterColoredText = ({
  text,
  color,
}: {
  text: string;
  color: string;
}) => {
  return (
    <ThemedText style={styles.header}>
      {text.split(" ").map((word, index) => (
        <React.Fragment key={index}>
          <ThemedText style={{ color, fontSize: 24 }}>
            {word.charAt(0)}
          </ThemedText>
          {word.substring(1)}{" "}
        </React.Fragment>
      ))}
    </ThemedText>
  );
};

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signIn } = useAuthStore((state) => state.actions);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  /* Existing code ... */
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [isGradeModalVisible, setGradeModalVisible] = useState(false);
  const [gradesLoading, setGradesLoading] = useState(true);

  // New state for Stage Selection
  const [selectedStage, setSelectedStage] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isStageModalVisible, setStageModalVisible] = useState(false);

  const STAGES = [
    { id: "middle", name: "اعدادي" },
    { id: "high", name: "ثانوي" },
    { id: "courses", name: "كورسات" },
  ];

  /* Fetch grades ... */
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const fetchedGrades = await GradeService.fetchGrades();
        setGrades(fetchedGrades);
      } catch (error) {
        Alert.alert("خطأ", "لم نتمكن من جلب المراحل الدراسية.");
      } finally {
        setGradesLoading(false);
      }
    };
    fetchGrades();
  }, []);

  // Filter grades based on selected stage
  const filteredGrades = grades.filter((grade) => {
    if (!selectedStage) return false;
    const gradeName = grade.name.toLowerCase();

    if (selectedStage.id === "middle") {
      return gradeName.includes("اعدادي") || gradeName.includes("إعدادي");
    }
    if (selectedStage.id === "high") {
      return gradeName.includes("ثانوي");
    }
    if (selectedStage.id === "courses") {
      // Assuming courses don't have "اعدادي" or "ثانوي" in their name, or have a specific keyword.
      // Adjust logic as per actual API data. For now, exclude the others.
      return (
        !gradeName.includes("اعدادي") &&
        !gradeName.includes("إعدادي") &&
        !gradeName.includes("ثانوي")
      );
    }
    return false;
  });

  const handleRegister = async () => {
    /* ... validation */
    if (!name || !phone || !password || !confirmPassword || !selectedGrade) {
      Alert.alert("خطأ", "الرجاء ملء جميع الحقول واختيار المرحلة الدراسية.");
      return;
    }
    /* ... rest of validation */
    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمتا المرور غير متطابقتين.");
      return;
    }

    setIsLoading(true);
    /* ... API call */
    try {
      const response = await axiosInstance.post("/register", {
        name,
        phone,
        password,
        grade_id: selectedGrade.id,
      });

      const { user, token } = response.data;

      if (user && token) {
        await signIn(user, token);
        router.replace("/");
      } else {
        Alert.alert("نجاح", "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.");
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "حدث خطأ غير متوقع.";
      Alert.alert("فشل التسجيل", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* ... Header images and input fields (name) ... */}
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
          />
          <FirstLetterColoredText
            text="Bright Ambition Minds"
            color={colors.primary}
          />
          <FirstLetterColoredText
            text="Building Our Own World"
            color={colors.primary}
          />
          <ThemedText style={styles.subheader}>
            عقول مشرقة طموحه تبني عالمنا
          </ThemedText>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                // { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="الاسم الكامل"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Stage Selection */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.input,
                {
                  // backgroundColor: colors.card,
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
              onPress={() => setStageModalVisible(true)}
            >
              <ThemedText
                style={{ color: selectedStage ? colors.text : "gray" }}
              >
                {selectedStage
                  ? selectedStage.name
                  : "اختر المرحلة (اعدادي/ثانوي)"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Grade Selection (Dependent on Stage) */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.input,
                {
                  // backgroundColor: colors.card,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: selectedStage ? 1 : 0.5, // Visual cue for disabled state
                },
              ]}
              onPress={() => {
                if (selectedStage) {
                  setGradeModalVisible(true);
                } else {
                  Alert.alert("تنبيه", "الرجاء اختيار المرحلة أولاً");
                }
              }}
              disabled={!selectedStage || gradesLoading}
            >
              <ThemedText
                style={{ color: selectedGrade ? colors.text : "gray" }}
              >
                {gradesLoading
                  ? "جاري تحميل البيانات..."
                  : selectedGrade
                    ? selectedGrade.name
                    : "اختر الصف الدراسي"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* ... Phone, Password, Button ... */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                // { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="رقم الهاتف"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                // { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                // { backgroundColor: colors.card, color: colors.text },
              ]}
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isPasswordVisible}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>إنشاء حساب</ThemedText>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <ThemedText style={{ color: colors.primary }}>
                لديك حساب بالفعل؟ سجل الدخول
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Stage Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isStageModalVisible}
        onRequestClose={() => setStageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.header}>اختر المرحلة</ThemedText>
            <FlatList
              data={STAGES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gradeItem}
                  onPress={() => {
                    setSelectedStage(item);
                    setSelectedGrade(null); // Reset grade when stage changes
                    setStageModalVisible(false);
                  }}
                >
                  <ThemedText>{item.name}</ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setStageModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>إغلاق</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grade Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isGradeModalVisible}
        onRequestClose={() => setGradeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.header}>اختر الصف</ThemedText>
            {filteredGrades.length > 0 ? (
              <FlatList
                data={filteredGrades}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gradeItem}
                    onPress={() => {
                      setSelectedGrade(item);
                      setGradeModalVisible(false);
                    }}
                  >
                    <ThemedText>{item.name}</ThemedText>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ThemedText>لا توجد صفوف متاحة لهذه المرحلة</ThemedText>
              </View>
            )}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setGradeModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>إغلاق</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: "contain",
  },
  header: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  subheader: {
    fontSize: 18,
    marginBottom: 30,
    color: "gray",
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    justifyContent: "center",

    marginBottom: 15,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.light.primary,
    // borderColor: "#ccc",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
  button: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginButton: {
    marginTop: 20,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    height: "40%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  gradeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
