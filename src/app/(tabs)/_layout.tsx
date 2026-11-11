import { router, Tabs } from "expo-router";
import {
  Home,
  Map,
  FileText,
  Settings,
  Plus,
  X,
  BrainCircuit,
  Video,
  ClipboardCheck,
} from "lucide-react-native";

import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

import Svg, { Path } from "react-native-svg";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

type TabRoute = {
  key: string;
  name: string;
};

type CustomTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  navigateToTab: (routeKey: string) => void;
  insets: {
    bottom: number;
  };
};

type PracticeRoute = "interview" | "mock-interview" | "skill-assessment";

const mainTabs = [
  { name: "index", label: "Home", Icon: Home },
  { name: "roadmap", label: "Roadmap", Icon: Map },
  { name: "practice", label: "Practice", Icon: Plus },
  { name: "resumes", label: "My Resume", Icon: FileText },
  { name: "settings", label: "Settings", Icon: Settings },
];

const practiceItems = [
  {
    title: "Interview",
    route: "interview" as PracticeRoute,
    Icon: BrainCircuit,
    x: -70,
    y: 0,
  },
  {
    title: "Mock Interview",
    route: "mock-interview" as PracticeRoute,
    Icon: Video,
    x: 0,
    y: -40,
  },
  {
    title: "Assessment",
    route: "skill-assessment" as PracticeRoute,
    Icon: ClipboardCheck,
    x: 70,
    y: 0,
  },
];

function CustomTabBar({ state, navigateToTab, insets }: CustomTabBarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();

  const menuAnimation = useRef(new Animated.Value(0)).current;

  const backgroundColor = isDark ? "#11121a" : "#ffffff";
  const activeColor = "#8b5cf6";
  const inactiveColor = isDark ? "#9999a8" : "#858594";
  const textColor = isDark ? "#ffffff" : "#171725";

  const horizontalPadding = 16;
  const barWidth = width - horizontalPadding * 2;
  const barHeight = 82;
  const bottomGap = 12;

  const practiceRoutes = practiceItems.map((item) => item.route);
  const currentRoute = state.routes[state.index]?.name;

  const isPracticeRoute = practiceRoutes.includes(
    currentRoute as PracticeRoute
  );

  const selectedIndex =
    isPracticeRoute || menuOpen
      ? 2
      : Math.max(
          0,
          mainTabs.findIndex((tab) => tab.name === currentRoute)
        );

  const tabWidth = barWidth / 5;
  const selectedX = tabWidth * selectedIndex + tabWidth / 2;

  useEffect(() => {
    Animated.spring(menuAnimation, {
      toValue: menuOpen ? 1 : 0,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [menuOpen, menuAnimation]);

  useEffect(() => {
    if (!isPracticeRoute && menuOpen) {
      setMenuOpen(false);
    }
  }, [currentRoute]);

  const handleTabPress = (name: string) => {
    if (name === "practice") {
      setMenuOpen((previous) => !previous);
      return;
    }

    const route = state.routes.find((item) => item.name === name);

    if (!route) {
      console.log("Tab route not found:", name);
      return;
    }

    setMenuOpen(false);
    navigateToTab(route.key);
  };

  const openPracticeRoute = (routeName: PracticeRoute) => {
    const route = state.routes.find((item) => item.name === routeName);

    if (!route) {
      console.log("Practice route not found:", routeName);
      console.log(
        "Available routes:",
        state.routes.map((item) => item.name)
      );
      return;
    }

    setMenuOpen(false);
    navigateToTab(route.key);
  };

  const notchWidth = 58;
  const notchDepth = 38;

  const notchPath = `
    M 32 0
    L ${selectedX - notchWidth} 0
    C ${selectedX - 42} 0 ${
    selectedX - 42
  } ${notchDepth} ${selectedX} ${notchDepth}
    C ${selectedX + 42} ${notchDepth} ${selectedX + 42} 0 ${
    selectedX + notchWidth
  } 0
    L ${barWidth - 32} 0
    Q ${barWidth} 0 ${barWidth} 32
    L ${barWidth} ${barHeight - 32}
    Q ${barWidth} ${barHeight} ${barWidth - 32} ${barHeight}
    L 32 ${barHeight}
    Q 0 ${barHeight} 0 ${barHeight - 32}
    L 0 32
    Q 0 0 32 0
    Z
  `;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { height: 220 + insets.bottom }]}
    >
      {/* Background overlay */}
      {menuOpen && (
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />
      )}

      {/* Practice semicircle background */}
      {menuOpen && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.practiceSemiCircle,
            {
              width: width * 0.58,
              height: width * 0.58,
              borderRadius: (width * 0.58) / 2,
              left: width * 0.21,
              bottom: barHeight + bottomGap + insets.bottom - width * 0.31 + 12,
              opacity: menuAnimation,
              transform: [
                {
                  scale: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
              backgroundColor,
              borderColor: isDark ? "#393052" : "#DDD3FF",
            },
          ]}
        />
      )}

      {/* Radial menu outside bottom bar */}
      {practiceItems.map((item) => {
        const Icon = item.Icon;

        const translateX = menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, item.x],
        });

        const translateY = menuAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, item.y],
        });

        return (
          <Animated.View
            key={item.route}
            collapsable={false}
            pointerEvents={menuOpen ? "auto" : "none"}
            style={[
              styles.practiceItem,
              {
                bottom: barHeight + bottomGap + insets.bottom + 5,
                left: width / 2 - 28,
                opacity: menuAnimation,
                zIndex: 30,
                elevation: 30,
                transform: [
                  { translateX },
                  { translateY },
                  {
                    scale: menuAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.4, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={() => openPracticeRoute(item.route)}
              style={[
                styles.practiceCircle,
                {
                  backgroundColor,
                  borderColor: isDark ? "#393052" : "#DDD3FF",
                },
              ]}
            >
              <Icon size={23} color={activeColor} />
            </Pressable>

            <Text style={[styles.practiceLabel, { color: textColor }]}>
              {item.title}
            </Text>
          </Animated.View>
        );
      })}

      {/* Floating bottom bar */}
      <View
        style={[
          styles.barWrapper,
          {
            left: horizontalPadding,
            right: horizontalPadding,
            bottom: bottomGap + insets.bottom,
            height: barHeight,
            width: barWidth,
          },
        ]}
      >
        {/* SVG curved background */}
        <Svg
          width={barWidth}
          height={barHeight}
          viewBox={`0 0 ${barWidth} ${barHeight}`}
          style={styles.svgBackground}
          pointerEvents="none"
        >
          <Path
            d={notchPath}
            fill={backgroundColor}
            stroke={isDark ? "#393052" : "#DDD3FF"}
            strokeWidth={1}
          />
        </Svg>

        {/* Tab buttons */}
        <View style={styles.tabRow}>
          {mainTabs.map((tab) => {
            const isPractice = tab.name === "practice";

            const isActive = isPractice
              ? isPracticeRoute || menuOpen
              : currentRoute === tab.name;

            const Icon = isPractice ? (menuOpen ? X : Plus) : tab.Icon;

            return (
              <Pressable
                key={tab.name}
                onPress={() => handleTabPress(tab.name)}
                style={styles.tabButton}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isActive && styles.activeIconContainer,
                    {
                      backgroundColor: isActive ? activeColor : "transparent",
                    },
                  ]}
                >
                  <Icon
                    size={23}
                    color={isActive ? "#ffffff" : activeColor}
                    strokeWidth={2.2}
                  />
                </View>

                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? activeColor : inactiveColor,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props: any) => (
        <CustomTabBar
          state={props.state}
          insets={props.insets}
          navigateToTab={(routeKey: string) => {
            const route = props.state.routes.find(
              (item: TabRoute) => item.key === routeKey
            );

            if (route) {
              router.navigate(
                `/(tabs)/${route.name === "index" ? "" : route.name}` as any
              );
            }
          }}
        />
      )}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="roadmap" />
      <Tabs.Screen name="resumes" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="interview" />
      <Tabs.Screen name="mock-interview" />
      <Tabs.Screen name="skill-assessment" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    overflow: "visible",
  },

  overlay: {
    position: "absolute",
    top: -500,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },

  barWrapper: {
    position: "absolute",
    borderRadius: 32,
    overflow: "visible",
    justifyContent: "flex-end",
    elevation: 8,
    zIndex: 20,
  },

  svgBackground: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  tabRow: {
    height: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 25,
    overflow: "visible",
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 82,
    zIndex: 2,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 29,
    marginTop: -35,
    elevation: 9,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },

  practiceItem: {
    position: "absolute",
    width: 56,
    alignItems: "center",
  },

  practiceCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    elevation: 8,
  },

  practiceLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
    width: 90,
  },

  practiceSemiCircle: {
    position: "absolute",
    zIndex: 15,
    elevation: 15,
    borderWidth: 1,
  },
});
