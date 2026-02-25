import { UseFormRegisterReturn } from "react-hook-form";
// ↑ react-hook-formのregister関数の戻り値の方をインポート

// このコンポーネントが受け取るpropsの方を定義
type FormInputProps = {
  label: string;
  registration?: UseFormRegisterReturn; // react-hook-formのregister関数の戻り値
  type?: string; // inputのtype属性（省略可能、デフォルトは"text"）
  placeholder?: string; 
  required?: boolean; // 必須入力かどうか
  disabled?: boolean;
  name?: string; // input要素のname属性
  value?: string; // input要素の値
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function FormInput({
  label,
  registration, // react-hook-formのregisterを受け取る
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  name,
  value,
  onChange,
}: FormInputProps) { // propsの型をFormInputPropsをして指定
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type={type} // inputのtype属性をセット（text, passsword, emailなど）
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded px-3 py-2"
        required={required} // 必須入力かどうかをセット
        disabled={disabled}
        name={name}
        value={value}
        onChange={onChange}
        {...registration} // react-hook-formのregisterの設定を全て展開してセット
      />
    </div>
  )
}