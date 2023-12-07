import * as React from "react";
import Svg, { SvgProps, G, Defs, Path } from "react-native-svg";

export default function CursorIcon(props: SvgProps) {
  return (
    <Svg width={48} height={48} viewBox="-3 0 20 20" fill="#000000" {...props}>
      <G strokeWidth={0} />
      <G strokeLinecap="round" strokeLinejoin="round" />
      <G>
        <Defs />
        <G stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
          <G transform="translate(-423.000000, -5399.000000)" fill="#D9DBF1">
            <G transform="translate(56.000000, 160.000000)">
              <Path d="M374,5248.219 C372.895,5248.219 372,5247.324 372,5246.219 C372,5245.114 372.895,5244.219 374,5244.219 C375.105,5244.219 376,5245.114 376,5246.219 C376,5247.324 375.105,5248.219 374,5248.219 M374,5239 C370.134,5239 367,5242.134 367,5246 C367,5249.866 370.134,5259 374,5259 C377.866,5259 381,5249.866 381,5246 C381,5242.134 377.866,5239 374,5239" />
            </G>
          </G>
        </G>
      </G>
    </Svg>
  );
}
