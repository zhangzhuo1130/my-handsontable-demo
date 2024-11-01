// config.js
export const columnConfigs = {
    "1": {
        require: true,
        type: "text"
    },
    "10": {
        require: true,
        type: "text"
    },
    "64": {
        require: true,
        type: "date",
        dateFormat: "YYYY-MM-DD"
    },
    "173": {
        require: false,
        type: "checkbox",
        checkedTemplate: "Y",
        uncheckedTemplate: "N"
    },
    "17": {
        require: false,
        type: "autocomplete",
        source: ["CNY", "NY","CNY1", "NY1"]
    }
};

// 你可以根据需要添加更多的配置
