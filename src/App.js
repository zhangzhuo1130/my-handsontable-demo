import React, {useRef, useState} from "react";
import {HotTable} from "@handsontable/react";
import {registerAllModules} from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import moment from "moment"; // 引入 moment.js 用于日期验证
import {columnConfigs} from "./config"; // 导入配置项

import "./App.css";

// register Handsontable's modules
registerAllModules();

const ExampleComponent = () => {
    const [data, setData] = useState([
        ["1", "酒店代码", "QU59V", "", "", ""],
        ["3", "酒店名称", "上海木华精品酒店", "北京五棵松和颐酒店", "上海松江开元名都大酒店", "北京国测酒店"],
        ["6", "酒店地址", "", "", "", ""],
        ["10", "城市", "", "上海", "", "北京"],
        ["44", "国家/地区全称", "中国", "", "", "", ""],
        ["64", "前台服务时间请使用24小时制，如00：00 - 23：59）", "", "", "", ""],
        ["71", "货币三字代码", "CNY", "CNY", "CNY", "CNY"],
        ["173", "客户协议价格是否可以返佣？11", "Y", "Y", "Y", "Y"]
    ]);
    console.log("data", JSON.stringify(data));
    const hotTableRef = useRef(null); // 使用 ref 来获取表格实例

    // 自定义日期验证函数
    const dateValidator = (value, callback) => {
        const isValid = moment(value, "YYYY-MM-DD", true).isValid(); // 检查是否为有效日期
        callback(isValid); // 通过或不通过
    };

    // 自定义选项验证函数
    const optionValidator = (value, callback, source) => {
        const isValid = source.includes(value); // 检查输入值是否在 source 中
        callback(isValid); // 通过或不通过
    };

    // 保存按钮的处理函数，点击时验证整个表格
    const handleSave = async () => {
        const hot = hotTableRef.current.hotInstance; // 获取 Handsontable 实例
        console.log(JSON.stringify({data: hot?.getData()}));
        // 触发验证
        try {
            const valid = await hot.validateCells();

            if (valid) {
                alert("所有单元格验证通过!");
                console.log("data", JSON.stringify({data: hot?.getData()}));
            } else {
                alert("表格中存在不符合规则的单元格，请检查输入!");
            }
        } catch (error) {
            console.error("验证过程中发生错误:", error);
            alert("验证过程中发生错误，请检查控制台以获取详细信息。");
        }
    };

    return (
        <div>
            <HotTable
                ref={hotTableRef}
                data={data}
                rowHeaders={true} // 行表头
                colHeaders={["问题编号", "问题名称", "上海木华精品酒店", "北京五棵松和颐酒店", "上海松江开元名都大酒店", "北京国测酒店"]}
                height="auto"
                autoWrapRow={true}
                autoWrapCol={true}
                licenseKey="non-commercial-and-evaluation" // for non-commercial use only
                columns={index => ({
                    readOnly: index === 0 || index === 1
                })}
                cells={(row, col, prop) => {
                    const questionKey = data[row]?.[0]; // 获取问题编号
                    const config = columnConfigs[questionKey] || {}; // 获取对应的配置项
                    let cellProperties = {};

                    // 排除第一列和第二列
                    if (col === 0 || col === 1) {
                        return cellProperties; // 不应用行级别规则
                    }
                    // 处理配置项
                    if (config.require) {
                        cellProperties.validator = (value, callback) => {
                            callback(value !== ""); // 非空验证
                        };
                    }

                    if (config.type) {
                        cellProperties.type = config.type;
                    }

                    if (config.dateFormat) {
                        cellProperties.dateFormat = config.dateFormat;
                        cellProperties.correctFormat = true; // 自动将输入格式化
                        cellProperties.validator = dateValidator; // 添加日期验证
                    }

                    if (config.checkedTemplate || config.uncheckedTemplate) {
                        cellProperties.checkedTemplate = config.checkedTemplate || "Y";
                        cellProperties.uncheckedTemplate = config.uncheckedTemplate || "N";
                    }

                    if (config.source) {
                        cellProperties.type = "autocomplete";
                        cellProperties.source = config.source; // 设置下拉选项的源
                        cellProperties.validator = (value, callback) => {
                            optionValidator(value, callback, config.source); // 使用自定义验证函数
                        };
                    }

                    return cellProperties;
                }}
            />
            <button onClick={handleSave}>保存</button>
        </div>
    );
};

export default ExampleComponent;
