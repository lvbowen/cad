import { PropertyNames } from "../control-like";

import { ContainerLike } from "../container-like";

import {
	FormControl,
	FormControlOptions,
	FormControlErrorCodes,
	FormControlType,
} from "./form-control";

import {
	ExpressionParser,
	ExpParseReuslt,
	ValueExpParseReuslt,
} from "../expression";

export interface TextControlOptions extends FormControlOptions<string> {
	/**
	 * 最小长度
	 */
	minLength?: number;

	/**
	 * 最大长度
	 */
	maxLength?: number;

	/**
	 * 模式，正则表达式
	 */
	pattern?: string | RegExp;

	/**
	 * 文本表达式
	 */
	textExp?: string;

	/**
	 * 限制长度
	 * 超出长度界限不赋值
	 */
	limitLength?: boolean;
}

export class TextControl extends FormControl<string> {
	private _pattern?: RegExp;

	minLength?: number;

	maxLength?: number;

	limitLength = true;

	constructor(options?: TextControlOptions) {
		super(options);

		if (options) {
			this.minLength = options.minLength;
			this.maxLength = options.maxLength;

			if (typeof options.limitLength === "boolean") {
				this.limitLength = options.limitLength;
			}

			const pattern = this.options.pattern;
			if (pattern) {
				if (typeof pattern === "string") {
					this._pattern = new RegExp(pattern);
				} else if (pattern instanceof RegExp) {
					this._pattern = pattern;
				}
			}
		}
	}

	get type() {
		return FormControlType.Text;
	}

	get options() {
		return this._options as TextControlOptions;
	}

	init(root: ContainerLike, parent: ContainerLike) {
		super.init(root, parent);

		if (this.options) {
			this.subscribeTextRefs(root, parent);
		}
	}

	update(noInitValue?: boolean) {
		super.update(noInitValue);

		if (this.options) {
			this.calculateTextExpValue();
		}
	}

	canSetValue(val: string | null) {
		if (super.isNullOrUndefined(val)) {
			return true;
		}

		if (typeof val !== "string") {
			return false;
		}

		// 最大长度
		if (
			this.limitLength &&
			val &&
			typeof this.maxLength === "number" &&
			val.trim().length > this.maxLength
		) {
			return false;
		}

		return true;
	}

	validateCore(required?: boolean) {
		this._errors = [];

		if (!this.disabled) {
			if (required && !this.validateRequired()) {
				return false;
			}

			if (!this.validateMinLength()) {
				return false;
			}

			if (!this.validateMaxLength()) {
				return false;
			}

			if (!this.validatePattern()) {
				return false;
			}
		}

		return true;
	}

	validateRequired() {
		// 对于设置必填且只读的文本控件暂不校验
		if (this.required && !this.readonly && (!this._value || this._value.trim().length === 0)) {
			super.setError(FormControlErrorCodes.Required);

			return false;
		}

		return true;
	}

	validatePattern() {
		if (!this._pattern || !this._value) {
			return true;
		}

		const valid = this._pattern.test(this._value);

		if (!valid) {
			super.setError(FormControlErrorCodes.Pattern);
		}

		return valid;
	}

	validateMinLength() {
		// 最小长度
		if (
			this.hasValue &&
			typeof this.minLength === "number" &&
			this._value !== null &&
			this._value.trim().length < this.minLength
		) {
			super.setError(FormControlErrorCodes.MinLength);
			return false;
		}

		return true;
	}

	validateMaxLength() {
		// 最小长度
		if (
			this.hasValue &&
			typeof this.maxLength === "number" &&
			this._value !== null &&
			this._value.trim().length > this.maxLength
		) {
			super.setError(FormControlErrorCodes.MaxLength);
			return false;
		}

		return true;
	}

	protected subscribeTextRefs(root: ContainerLike, parent?: ContainerLike) {
		const expParseReuslt = this.parseTextExp(
			PropertyNames.Value,
			this.options.textExp
		);

		if (!expParseReuslt) {
			return;
		}

		const _this = this;
		const func = () => {
			_this.calculateTextExpValue();
		};

		this.subscribeControlValueChange(expParseReuslt.keys, root, parent, func);
	}

	/**
	 * 解析值表达式
	 * @param name
	 */
	protected parseTextExp(name: PropertyNames, exp: any) {
		// const exp = (this._options as any)[name];

		if (typeof exp !== "string" || !exp) {
			return;
		}

		if (!this._expReusltMap) {
			this._expReusltMap = {};
		}

		let expParseReuslt = this._expReusltMap[name];

		if (expParseReuslt) {
			return expParseReuslt;
		}

		expParseReuslt = ExpressionParser.parseTextExp(exp);

		this._expReusltMap[name] = expParseReuslt;

		return expParseReuslt;
	}

	/**
	 * 计算逻辑表达式属性的值
	 */
	protected calculateTextExpValue() {
		if (!this._options) {
			return;
		}

		const exp = this.options.textExp;

		const expParseReuslt = this.parseTextExp(PropertyNames.Value, exp);

		// console.log('calculatePropertyValue', expParseReuslt);

		if (expParseReuslt) {
			const val = this.callTextCalculateFunc(expParseReuslt);
			// this.value = val;
			if (typeof val === 'number') {
				this.value = val.toString();
			}else {
				this.value = val
			}
		}
	}

	callTextCalculateFunc(expParseReuslt: ExpParseReuslt) {
		const controls = this._refControls;
		if (controls) {
			const arg: any = {};

			expParseReuslt.keys
				.filter((k) => k.indexOf(".") > -1)
				.forEach((k) => {
					const arr = k.split(".");
					if (arg[arr[0]] === undefined) {
						arg[arr[0]] = {};
					}
					if (arr[1] === "sortKey") {
						const idx = this.options.rowIndex;
						arg[arr[0]][arr[1]] =
							typeof idx === "number" ? (idx + 1).toString() : "";
					} else {
						arg[arr[0]][arr[1]] = controls[k];
					}
				});

			expParseReuslt.keys
				.filter((k) => k.indexOf(".") === -1)
				.forEach((k) => (arg[k] = controls[k]));

			try {
				// debugger
				const result = expParseReuslt.func(arg);
				// console.log('callCalculateFunc', arg, result);
				return result;
			} catch (error) {
				console.info("callCalculateFunc:" + error);
				//throw error;
			}
		}else if(expParseReuslt.exp.trim()==='this.getIP()'){
			const result = expParseReuslt.func();
			return result
		}
	}
}
