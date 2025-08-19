
import type { Suggestion, PseudoCode } from '../types';

export const generatePseudoCode = (suggestion: Suggestion): PseudoCode => {
  const { column_name, original_value, suggested_value, suggestion_type, row_index } = suggestion;
  
  // Basic sanitization for code generation
  const col = column_name.replace(/ /g, '_');
  const orig = typeof original_value === 'string' ? `"${original_value.replace(/"/g, '\\"')}"` : original_value;
  const sugg = typeof suggested_value === 'string' ? `"${suggested_value.replace(/"/g, '\\"')}"` : suggested_value;

  let rCode = `# R code for: ${suggestion.description}`;
  let pythonCode = `# Python (pandas) code for: ${suggestion.description}`;

  switch (suggestion_type) {
    case 'STANDARDIZE_TEXT':
      if (row_index !== undefined) {
        // R uses 1-based indexing for rows
        rCode += `\ndf[${row_index + 1}, "${col}"] <- ${sugg}`;
        // Python uses 0-based indexing
        pythonCode += `\ndf.loc[${row_index}, "${col}"] = ${sugg}`;
      } else {
        rCode += `\ndf$${col}[df$${col} == ${orig}] <- ${sugg}`;
        pythonCode += `\ndf.loc[df['${col}'] == ${orig}, '${col}'] = ${sugg}`;
      }
      break;
    
    case 'FIX_FORMAT':
    case 'IMPUTE_MISSING':
       if (row_index !== undefined) {
        rCode += `\ndf[${row_index + 1}, "${col}"] <- ${sugg}`;
        pythonCode += `\ndf.loc[${row_index}, "${col}"] = ${sugg}`;
      } else {
         rCode += `\n# (Action required) Update column '${col}' with value ${sugg}`;
         pythonCode += `\n# (Action required) Update column '${col}' with value ${sugg}`;
      }
      break;
      
    case 'FLAG_OUTLIER':
       if (row_index !== undefined) {
        rCode += `\n# Review outlier at df[${row_index + 1}, "${col}"]`;
        pythonCode += `\n# Review outlier at df.loc[${row_index}, "${col}"]`;
      } else {
         rCode += `\n# Review outliers in column '${col}'`;
         pythonCode += `\n# Review outliers in column '${col}'`;
      }
      break;
      
    default:
      rCode += `\n# No pseudo-code generated for this action.`;
      pythonCode += `\n# No pseudo-code generated for this action.`;
      break;
  }

  return { r: rCode, python: pythonCode };
};
