# Todo:

- Offer to and then add packages if missing
- casing preference for file names
- option for a testing provider

Restrictions

- NO internal dependencies (avoid recursion in the add CLI, keeps each package decoupled and well scoped)
- NO fancy testing stuff (avoids needing to worry about missing dev dependencies, keeps API broadly compatible with jest)
