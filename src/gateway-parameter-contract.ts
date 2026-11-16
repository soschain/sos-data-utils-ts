/** Private configuration attribute shape; presence does not grant indexing or actor authority. */
export interface GatewayParamAttribute {
  name: string;
  value: string | number | undefined;
  unique?: boolean;
}

/**
 * Existing gateway configuration/search parameter profile, distinct from a
 * native FHIR SearchParameter. Configured type extensions remain textual;
 * validation, encryption and uniqueness decisions belong to the caller.
 */
export interface GatewayParameterData extends GatewayParamAttribute {
  type: string;
  system?: string;
  unit?: string;
  period?: boolean;
  end?: string;
  prefix?: string;
  intDisplay?: string;
  localizedText?: string;
  hint?: string;
  optionsList?: unknown[];
  appliesTo?: string[];
}
