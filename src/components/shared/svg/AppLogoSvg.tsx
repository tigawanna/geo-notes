import { ComponentProps } from "react";
import { useTheme } from "react-native-paper";
import Svg, { Circle, Defs, G, Path } from "react-native-svg";

export function AppLogoSvg(props: ComponentProps<typeof Svg>) {
  const { colors } = useTheme();
  return (
    <Svg
      strokeWidth={1}
      width={80}
      height={50}
      viewBox="0 0 24 24"
      id="Layer_1"
      data-name="Layer 1"
      // xmlns="http://www.w3.org/2000/svg"
      // fill={colors.primary}
      stroke={colors.primary}
      {...props}>
      <G id="SVGRepo_iconCarrier">
        <Defs></Defs>
        <Path
          strokeWidth={1}
          d="M15.91 11h4.88a2 2 0 012 2v7.81a2 2 0 01-2 2h-5.86l-1.42-2.12a1.81 1.81 0 00-3 0l-1.44 2.06H3.21a2 2 0 01-2-2V13a2 2 0 012-2h4.88"
        />
        <Path stroke={colors.primary} d="M4.18 14.93L6.14 14.93" />
        <Path stroke={colors.primary} d="M4.18 18.84L6.14 18.84" />
        <Path
          strokeWidth={1}
          d="M15.91 5.16C15.91 8.09 12 11 12 11S8.09 8.09 8.09 5.16a3.91 3.91 0 017.82 0z"
        />
        <Circle strokeWidth={1} cx={12} cy={5.16} r={0.98} stroke={colors.primary} />
      </G>
    </Svg>
  );
}
