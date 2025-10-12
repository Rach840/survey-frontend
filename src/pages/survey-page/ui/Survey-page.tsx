'use client'
import {GeneratedForm} from "@/features/template/generated";
import {DynamicFormDef} from "@/features/template/generated/model";

export function SurveyPage(){
    const demoSchema: DynamicFormDef = {
        title: "Форма",
        sections: [
            {
                id: "1760275918914",
                code: "name",
                title: "ФИО",
                fields: [
                    { id: "1760275940370", code: "last_name", type: "text", label: "Фамилия", required: true, placeholder: "Иванов" },
                    { id: "1760275972015", code: "first_name", type: "text", label: "Имя", required: true, placeholder: "Иван" },
                ],
            },
            {
                id: "1760276007194",
                code: "bitrh",
                title: "Дата рождения",
                fields: [
                    { id: "1760276024391", code: "bitrh", type: "date", label: "дата рождения", required: true },
                ],
            },
        ],
    };


    return <GeneratedForm schema={demoSchema} onSubmit={(v) => console.log("submit", v)} />;
}