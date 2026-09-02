import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# I will find the occurrence of "</div>\n          )\n        }\n      />"
bad_string = "          </div>\n          )\n        }\n      />"
good_string = "          </div>\n        }\n      />"

if bad_string in content:
    content = content.replace(bad_string, good_string)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Fixed App.tsx!")
else:
    print("Not found.")

