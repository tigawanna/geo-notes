import { Linking, StyleSheet } from "react-native";
import { List } from "react-native-paper";
import * as Application from "expo-application";

export function AboutSettings() {
  const developerFacingBuildVersion = Application.nativeApplicationVersion;

  const authorInfo = {
    name: "tigawanna",
    github: "https://github.com/tigawanna",
    website: "https://tigawanna-portfolio.vercel.app",
    email: "denniskinuthiawaweru@gmail.com",
  };

  return (
    <List.Section>
      <List.Subheader style={[styles.listSubHeader]}>About</List.Subheader>
      <List.Item
        title="Author"
        description={authorInfo.name}
        left={(props) => <List.Icon {...props} icon="account" />}
        onPress={() => Linking.openURL(authorInfo.website)}
      />
      <List.Item
        title="Github"
        description={authorInfo.github}
        left={(props) => <List.Icon {...props} icon="github" />}
        onPress={() => Linking.openURL(authorInfo.github)}
      />
      <List.Item
        title="Version"
        description={developerFacingBuildVersion ?? "??"}
        left={(props) => <List.Icon {...props} icon="information" />}
      />
    </List.Section>
  );
}

const styles = StyleSheet.create({
  listSubHeader: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
