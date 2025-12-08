import { view, label } from "valdi";
import { colors, spacing } from "./Layout";

interface KinaraProps {
    litCandles: number;
}

export function Kinara({ litCandles }: KinaraProps) {
    return view(
        { style: { flexDirection: "row", justifyContent: "center", marginVertical: spacing.large } },
        Array.from({ length: 7 }, (_, i) => view(
            { key: i, style: { width: 20, height: 60, marginHorizontal: spacing.small, backgroundColor: i < litCandles ? colors.candleLit : colors.candleUnlit, borderRadius: 4 } },
            label({ style: { textAlign: "center", marginTop: 4 } }, (7 - i).toString())
        ))
    );
}