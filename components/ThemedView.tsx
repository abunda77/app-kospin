import { View, type ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";
import { styled } from "nativewind";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

const StyledView = styled(View);

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className = "",
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <StyledView
      style={[{ backgroundColor }, style]}
      className={twMerge(className)}
      {...otherProps}
    />
  );
}
