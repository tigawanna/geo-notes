import { createNoteMutationFunction } from "@/data-access-layer/mutate-notes";
import { useSnackbarStore } from "@/lib/react-native-paper/snackbar/global-snackbar-store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FAB } from "react-native-paper";


export function NewGeoNoteTrigger() {
  const router = useRouter();
  const { showSnackbar } = useSnackbarStore();
  const { mutate} = useMutation({
    ...createNoteMutationFunction,
    onSuccess(data, variables, onMutateResult, context) {
      if (data.error) {
        console.log("::: createNoteMutationFunction error", data.error);
        return showSnackbar(data.error, { duration: 5000 });
      }
      if (data.result) {
        router.push(`/notes/${data.result}`);
      }
    },
  });
  return (
    <FAB
      icon={"plus"}
      onPress={async () => {
        mutate({
          payload: {
            title: "Untitled",
          },
        });
      }}
      style={[
        {
          bottom: 16,
          right: 16,
          position: "absolute",
        },
      ]}
    />
  );
}

