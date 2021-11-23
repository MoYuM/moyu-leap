import { CustomTemplate } from './interface';

const customTemplate: CustomTemplate[] = [
  {
    "name": "Form",
    "body": "<Form \n\tname=\"{{name}}\"\n>\n\t{{children}}\n</Form>",
    "children": [
      {
        "name": "Input",
        "body": "<Form.Item \n\tname=\"{{name}}\" \n\tlabel=\"{{label}}\"\n>\n\t<Input />\n</Form.Item>"
      },
      {
        "name": "Select",
        "body": "<Form.Item \n\tname=\"{{name}}\" \n\tlabel=\"{{babel}}\"\n>\n\t<Select />\n</Form.Item>"
      },
      {
        "name": "empty",
        "body": "<Form.Item \n\tname=\"empty\" \n\tlabel=\"empty\">\n\t<></>\n</Form.Item>"
      },
    ]
  }
]

export default customTemplate;