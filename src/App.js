import React, { useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import moment from "moment"; // 引入 moment.js 用于日期验证
import { columnConfigs } from "./config"; // 导入配置项

import "./App.css";

// register Handsontable's modules
registerAllModules();

const generateLargeData = (numRows, numCols) => {
    const baseRow = ["1", "酒店代码", "QU59V", "", "", ""]; // 可选的基础数据模板
    const generatedData = [];

    for (let i = 0; i < numRows; i++) {
        const row = Array.from({ length: numCols }, (_, colIndex) => {
            // 使用不同的生成逻辑：如编号列使用当前行号，其他列生成模拟数据
            if (colIndex === 0) return (i + 1).toString(); // 第一列为编号
            if (colIndex === 1) return `酒店名称 ${i + 1}`; // 第二列为酒店名称
            return `R${i + 1}C${colIndex + 1}`; // 其他列使用 "R行号C列号" 格式的模拟数据
        });
        generatedData.push(row);
    }

    return generatedData;
};

const ExampleComponent = () => {
    // const dataRef = useRef([
    //     ["1", "酒店代码", "QU59V", "", "", ""],
    //     ["3", "酒店名称", "上海木华精品酒店", "北京五棵松和颐酒店", "上海松江开元名都大酒店", "北京国测酒店"],
    //     ["6", "酒店地址", "", "", "", ""],
    //     ["10", "城市", "", "上海", "", "北京"],
    //     ["44", "国家/地区全称", "中国", "", "", "", ""],
    //     ["64", "前台服务时间请使用24小时制，如00：00 - 23：59）", "", "", "", ""],
    //     ["71", "货币三字代码", "CNY", "CNY", "CNY", "CNY"],
    //     ["173", "客户协议价格是否可以返佣？11", "Y", "Y", "Y", "Y"]
    // ]);
    const dataRef = useRef(generateLargeData(30, 700)); // 将生成的数据放入 ref，模拟 1000 行数据
    const hotTableRef = useRef(null);

    // 自定义日期验证函数
    const dateValidator = (value, callback) => {
        const isValid = moment(value, "YYYY-MM-DD", true).isValid();
        callback(isValid);
    };

    // 自定义选项验证函数
    const optionValidator = (value, callback, source) => {
        const isValid = source.includes(value);
        callback(isValid);
    };

    // 保存按钮的处理函数，点击时验证整个表格
    const handleSave = async () => {
        const hot = hotTableRef.current.hotInstance;
        console.log(JSON.stringify({ data: hot?.getData() }));

        try {
            const valid = await hot.validateCells();

            if (valid) {
                alert("所有单元格验证通过!");
                console.log("data", JSON.stringify({ data: hot?.getData() }));
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
                data={dataRef.current} // 从ref.current里面获取数据
                rowHeaders={true}
                colHeaders={["问题编号", "问题名称", "上海木华精品酒店", "北京五棵松和颐酒店", "上海松江开元名都大酒店", "北京国测酒店"]}
                height="auto"
                autoWrapRow={true}
                autoWrapCol={true}
                licenseKey="non-commercial-and-evaluation"
                columns={index => ({
                    readOnly: index === 0 || index === 1
                })}
                cells={(row, col) => {
                    const questionKey = dataRef.current[row]?.[0];
                    const config = columnConfigs[questionKey] || {};
                    let cellProperties = {};

                    if (col === 0 || col === 1) {
                        return cellProperties;
                    }
                    if (config.require) {
                        cellProperties.validator = (value, callback) => {
                            callback(value !== "");
                        };
                    }
                    if (config.type) {
                        cellProperties.type = config.type;
                    }
                    if (config.dateFormat) {
                        cellProperties.dateFormat = config.dateFormat;
                        cellProperties.correctFormat = true;
                        cellProperties.validator = dateValidator;
                    }
                    if (config.checkedTemplate || config.uncheckedTemplate) {
                        cellProperties.checkedTemplate = config.checkedTemplate || "Y";
                        cellProperties.uncheckedTemplate = config.uncheckedTemplate || "N";
                    }
                    if (config.source) {
                        cellProperties.type = "autocomplete";
                        cellProperties.source = config.source;
                        cellProperties.filter = false; // 禁用自动过滤，用户已选CNY后重新选择可以看到全部内容
                        cellProperties.validator = (value, callback) => {
                            optionValidator(value, callback, config.source);
                        };
                    }

                    return cellProperties;
                }}
                autoColumnSize={false} // 关闭自动调整列宽，大量列时能减少一些性能开销
            />
            <button onClick={handleSave}>保存</button>
        </div>
    );
};

export default ExampleComponent;
