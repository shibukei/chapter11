import { UseFormRegisterReturn } from "react-hook-form";
// ↑ react-hook-formのregister関数の戻り値の方をインポート

// このコンポーネントが受け取るpropsの方を定義
type FormInputProps = {
  label: string;
  registration?: UseFormRegisterReturn; // react-hook-formのregister関数の戻り値
} & React.ComponentProps<'input'>; // inputの全属性をまとめて受け取る

export default function FormInput({
  label,
  registration, // react-hook-formのregisterを受け取る
  ...props // inputの属性をまとめて受け取る
}: FormInputProps) { // propsの型をFormInputPropsをして指定
  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        className="w-full border border-gray-300 rounded px-3 py-2"
        {...props} // inputの属性をそのまま渡す
        {...registration} // react-hook-formのregisterの設定を全て展開してセット
      />
    </div>
  )
}