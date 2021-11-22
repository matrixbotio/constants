Main
    = Expression

_ "whitespace"
    = [ \t\n\r]*

Integer
    = _ [1-9][0-9]* { return parseInt(text(), 10) }

Float
    = _ [0-9]+ ("."[0-9]+)? { return parseFloat(text()) }

DurationYears
    = dl:Integer "Y" { return parseInt(dl, 10) }

DurationMonths
    = dl:[2-9] "M" { return parseInt(dl, 10) }
    / dl:("1"[01]?) "M" { return parseInt(dl.join(""), 10) }

DurationWeeks
    = dl:[1-4] "W" { return parseInt(dl, 10) }

DurationDays
    = dl:[1-6] "D" { return parseInt(dl, 10) }

DurationHours
    = dl:[3-9] "h" { return parseInt(dl, 10) }
    / dl:("1"[0-9]?) "h" { return parseInt(dl.join(""), 10) }
    / dl:("2"[0-3]?) "h" { return parseInt(dl.join(""), 10) }

Duration_1_59_Int
    = [6-9] { return parseInt(text(), 10) }
    / ([1-5][0-9]?) { return parseInt(text(), 10) }

DurationMinutes
    = dl:Duration_1_59_Int "m" { return dl }

DurationSeconds
    = dl:Duration_1_59_Int "s" { return dl }

Duration
    = y:DurationYears? mm:DurationMonths? w:DurationWeeks? d:DurationDays? h:DurationHours? m:DurationMinutes? s:DurationSeconds? {
        return {
            years: y || 0,
            months: mm || 0,
            weeks: w || 0,
            days: d || 0,
            hours: h || 0,
            minutes: m || 0,
            seconds: s || 0,
        };
    }

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
    = indicator:IndicatorName "(" _ du:Duration _ "," _ bc:Integer _ ")" {
        return {
            indicator,
            interval: du,
            bar_count: bc,
        };
    }
    / indicator:IndicatorName "(" _ bc:Integer _ ")" {
        return {
            indicator,
            interval: {
                years: 0,
                months: 0,
                weeks: 0,
                days: 0,
                hours: 0,
                minutes: 1,
                seconds: 0,
            },
            bar_count: bc,
        };
    }
    / indicator:IndicatorName "(" _ du:Duration _ ")" {
        return {
            indicator,
            interval: du,
            bar_count: 1,
        };
    }
    / indicator:IndicatorName {
        return {
            indicator,
            interval: {
                years: 0,
                months: 0,
                weeks: 0,
                days: 0,
                hours: 0,
                minutes: 1,
                seconds: 0,
            },
            bar_count: 1,
        };
    }

CompOperator
    = ">"
    / "<"

Relation
    = op1:Indicator _ comp:CompOperator _ op2:Float {
       return {
           operand_1_type: "indicator",
           operand_1: op1,
           operand_2_type: "number",
           operand_2: op2,
           operator: comp,
       };
    }
    / op1:Float _ comp:CompOperator _ op2:Indicator {
       return {
           operand_1_type: "number",
           operand_1: op1,
           operand_2_type: "indicator",
           operand_2: op2,
           operator: comp,
       };
    }
    / op1:Indicator _ comp:CompOperator _ op2:Indicator {
       return {
           operand_1_type: "indicator",
           operand_1: op1,
           operand_2_type: "indicator",
           operand_2: op2,
           operator: comp,
       };
    }

Expression
    = rn:((Relation _ "&" _)* Relation) {
        // last relation will be not wrapped into array
        const last_relation = rn.pop();
        // if there are relations wrapped into array, unwrap them and add last one, else return only last
        return rn[0] ? [...rn[0].map(([r]) => r), last_relation] : [last_relation];
    }
