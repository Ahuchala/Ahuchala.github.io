needsPackage "Schubert2";

-- Function to compute Hodge numbers for a complete intersection.
flagHodgeNumbers = (dims, r) -> (
    G = flagBundle(dims, base (d_1..d_r));
    X = sectionZeroLocus sum for i from 1 to r list OO_G(d_i);
    OmG = cotangentBundle G;
    OmX = cotangentBundle X;
    hodgeNumbers = for i from 0 to floor(dim(X)/2) list (
        (-1)^(i + dim X) * (chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
    );
    hodgeNumbers
);

-- Build the database of Hodge numbers.
computeFlagHodgeNumbers = (nBound, rBound) -> (
    db := new MutableHashTable;
    for n from 4 to nBound do (
        P = partitions(n);
        for p in P do (
            dims = toList p;
            if (#dims > 1 and dims != {n-1,1} and dims != {n-2,2}) then (
                for r from 1 to rBound do (
                    key = "(" | toString(dims) | ", " | toString(r) | ")";
                    hodge = flagHodgeNumbers(dims, r);
                    db#key = toString hodge;
                );
            );
        );
    );
    db
);

-- Export the database as a JSON file.
exportDatabaseJSON = (db, filename) -> (
    jsonStr = "{\n";
    firstEntry = true;
    for key in keys db do (
        if not firstEntry then jsonStr = jsonStr | ",\n";
        firstEntry = false;
        val = db#key;
        jsonStr = jsonStr | "  \"" | key | "\": \"" | val | "\"";
    );
    jsonStr = jsonStr | "\n}\n";
    f = filename << "";
    f << jsonStr;
    close f;
);

-- Test case: using nBound = 4 and rBound = 2.
db = computeFlagHodgeNumbers(7, 3);
exportDatabaseJSON(db, "flag_hodge_numbers.txt");
