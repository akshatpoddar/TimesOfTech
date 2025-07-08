import { ORANGE } from "@constants/theme";
import { ActivityIndicator } from "react-native";

const LoadingIndicator = () => {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={ORANGE} />;
}

export default LoadingIndicator