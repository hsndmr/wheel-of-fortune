import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from "react";
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";
import * as d3 from "d3-shape";
import { G, Path, Svg, Text } from "react-native-svg";
import { StoreApi, UseBoundStore, create, useStore } from "zustand";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import CursorIcon from "./CursorIcon";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  PanGesture,
} from "react-native-gesture-handler";

export type AnimatedStyle = StyleProp<
  Animated.AnimateStyle<StyleProp<ViewStyle>>
>;

export interface SegmentModel {
  path: any;
  value: string;
  x: number;
  y: number;
}

const WIDTH = Dimensions.get("window").width;
const ONE_TURN = 360;
const WHEEL_SIZE = WIDTH * 0.8;

const createArc = d3
  .arc()
  .innerRadius(5)
  .outerRadius(WIDTH / 2);

const createSegments = (segments: string[]): SegmentModel[] => {
  const archData: number[] = Array.from({
    length: segments.length,
  });

  const arcs = d3
    .pie()
    .value(() => 1)
    .sort(null)(archData);

  return arcs.map((arc, index) => {
    // @ts-ignore
    const [x, y] = createArc.centroid(arc);

    return {
      // @ts-ignore
      path: createArc(arc),
      value: segments[index],
      x: x,
      y: y,
    };
  });
};

export interface WheelOfFortuneState {
  segments: SegmentModel[];
  angleOffset: number;
  angleBySegment: number;
}

export type WheelOfFortuneStore = UseBoundStore<StoreApi<WheelOfFortuneState>>;

// @ts-ignore
const WheelOfFortuneContext = createContext<WheelOfFortuneStore>();

export const useWheelOfFortuneStore = () => {
  return useContext(WheelOfFortuneContext);
};

export interface SegmentProps {
  segment: SegmentModel;
  index: number;
}

export function Segment({ segment, index }: SegmentProps) {
  const store = useWheelOfFortuneStore();
  const numberOfSegments = useStore(store, (state) => state.segments.length);
  const angleOffset = useStore(store, (state) => state.angleOffset);

  return (
    <G>
      <Path
        d={segment.path}
        fill={index % 2 === 0 ? "white" : "#9EA1E7"}
      ></Path>
      <G
        rotation={(index * ONE_TURN) / numberOfSegments + angleOffset}
        origin={`${segment.x}, ${segment.y}`}
      >
        <Text
          fontSize={60}
          fill="white"
          x={segment.x}
          y={segment.y - 5}
          textAnchor="middle"
        >
          {segment.value}
        </Text>
      </G>
    </G>
  );
}

export interface WheelOfFortuneProviderProps extends PropsWithChildren {
  segments: string[];
}

export function WheelOfFortuneProvider({
  segments,
  children,
}: WheelOfFortuneProviderProps) {
  const store = useMemo(() => {
    const angleBySegment = ONE_TURN / segments.length;
    const angleOffset = angleBySegment / 2;

    return create<WheelOfFortuneState>(() => ({
      segments: createSegments(segments),
      angleOffset: angleOffset,
      angleBySegment: angleBySegment,
    }));
  }, [segments]);

  return (
    <WheelOfFortuneContext.Provider value={store as WheelOfFortuneStore}>
      {children}
    </WheelOfFortuneContext.Provider>
  );
}

export function CursorContainer({ style, ...rest }: { style?: AnimatedStyle }) {
  return (
    <Animated.View
      style={[
        {
          marginTop: -WHEEL_SIZE / 2,
          zIndex: 2,
        },
        style,
      ]}
      {...rest}
    >
      <CursorIcon />
    </Animated.View>
  );
}

export function WheelOfFortuneContainer({
  style,
  pan,
  ...rest
}: {
  style?: AnimatedStyle;
  pan: PanGesture;
}) {
  const store = useWheelOfFortuneStore();
  const segments = useStore(store, (state) => state.segments);
  const angleOffset = useStore(store, (state) => state.angleOffset);

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.container, style]} {...rest}>
          <View style={styles.wheelOfFortuneContainer}>
            <Svg
              width={WHEEL_SIZE}
              height={WHEEL_SIZE}
              viewBox={`0 0 ${WIDTH} ${WIDTH}`}
              style={{
                transform: [
                  {
                    rotate: `-${angleOffset}deg`,
                  },
                ],
              }}
            >
              <G y={WIDTH / 2} x={WIDTH / 2}>
                {segments.map((segment, index) => {
                  return (
                    <Segment
                      key={segment.value}
                      segment={segment}
                      index={index}
                    />
                  );
                })}
              </G>
            </Svg>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

export interface WheelOfFortuneProps extends ViewProps {
  segments: string[];
}

export function WheelOfFortune({ segments, ...rest }: WheelOfFortuneProps) {
  const rotation = useSharedValue(0);
  const hasStartedSpinning = useSharedValue(false);
  const isSpinning = useSharedValue(false);
  const cursorRotation = useDerivedValue(() => {
    if (!isSpinning.value) {
      return 1;
    }

    return Math.sin((rotation.value * Math.PI) / 180);
  });

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (hasStartedSpinning.value) {
        return;
      }
      hasStartedSpinning.value = true;

      rotation.value = 0;
    })
    .onFinalize(() => {
      if (isSpinning.value) {
        return;
      }

      isSpinning.value = true;

      const numberOfRotation = 6;
      const duration = 1000 * numberOfRotation;
      const randomSegmentIndex = Math.floor(Math.random() * segments.length);

      rotation.value = withTiming(
        (360 / segments.length) * randomSegmentIndex +
          numberOfRotation * ONE_TURN,
        {
          duration: duration,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            isSpinning.value = false;
            hasStartedSpinning.value = false;
          }
        }
      );
    });

  const svgAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(rotation.value, [0, 360], [0, 360])}deg`,
        },
      ],
    };
  });

  const cursorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(cursorRotation.value, [1, -1], [0, 35])}deg`,
        },
      ],
    };
  });

  return (
    <WheelOfFortuneProvider segments={segments}>
      <View style={[styles.container]} {...rest}>
        <CursorContainer style={cursorAnimatedStyle} />
        <WheelOfFortuneContainer pan={pan} style={svgAnimatedStyle} />
      </View>
    </WheelOfFortuneProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  wheelOfFortuneContainer: {
    padding: 5,
    borderColor: "#9EA1E7",
    borderWidth: 14,
    borderRadius: WIDTH,
  },
});
