{
    const DEFAULT_INTERVAL = "1m";

    function relation(operand1type, operand1, operand2type, operand2, operator){
        return {
            operand1: {
                type: operand1type,
                value: operand1,
            },
            operand2: {
                type: operand2type,
                value: operand2,
            },
            operator,
        };
    }
}

Main
    = Expression

_ "whitespace"
    = [ \t\n\r]*

Integer
    = _ "-"? [0-9]+ { return parseInt(text(), 10) }

Float
    = _ "-"? [0-9]+ ("."[0-9]+)? { return parseFloat(text()) }

Interval
    = "1m"
    / "3m"
    / "5m"
    / "15m"
    / "30m"
    / "1h"
    / "2h"
    / "4h"
    / "6h"
    / "8h"
    / "12h"
    / "1d"
    / "3d"
    / "1w"

IndicatorName
    = "CLOSE"
    / "OPEN"
    / "HIGH"
    / "LOW"
    / "CCI"
    / "MA"
    / "SAR"
    / "BB_UPPER"
    / "BB_MIDDLE"
    / "BB_LOWER"
    / "ADX"
    / "ATR"
    / "MACD"
    / "VOLUME"
    / "VOLATILITY"
    / "RSI"
    / "PUMPDUMP"
    / "PUMPDUMPOPT"

Indicator
    = indicator:IndicatorName "(" _ i:Interval _ "," _ bc:Integer _ ")" {
        return {
            indicator,
            interval: i,
            bar_count: bc,
        };
    }
    / indicator:IndicatorName "(" _ bc:Integer _ ")" {
        return {
            indicator,
            interval: DEFAULT_INTERVAL,
            bar_count: bc,
        };
    }
    / indicator:IndicatorName "(" _ i:Interval _ ")" {
        return {
            indicator,
            interval: i,
            bar_count: 1,
        };
    }
    / indicator:IndicatorName {
        return {
            indicator,
            interval: DEFAULT_INTERVAL,
            bar_count: 1,
        };
    }

CompOperator
    = ">"
    / "<"

Relation
    = op1:Indicator _ comp:CompOperator _ op2:Float {
        return relation(
            "indicator",
            op1,
            "number",
            op2,
            comp,
        );
    }
    / op1:Float _ comp:CompOperator _ op2:Indicator {
        return relation(
            "number",
            op1,
            "indicator",
            op2,
            comp,
        );
    }
    / op1:Indicator _ comp:CompOperator _ op2:Indicator {
        return relation(
            "indicator",
            op1,
            "indicator",
            op2,
            comp,
        );
    }

Expression
    = rn:((Relation _ "&" _)* Relation) {
        // last relation will be not wrapped into array
        const last_relation = rn.pop();
        // if there are relations wrapped into array, unwrap them and add last one, else return only last
        return rn[0] ? [...rn[0].map(([r]) => r), last_relation] : [last_relation];
    }

