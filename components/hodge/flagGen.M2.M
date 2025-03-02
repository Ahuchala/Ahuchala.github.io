

-- Function to compute Hodge numbers for a complete intersection of r hypersurfaces in Fl(dims) with len(dims) = 3
needsPackage "Schubert2";
flagHodgeNumbers = (dims, r) -> (
    G = flagBundle(dims, base join(d_1..d_r,e_1..e_r));
    (L1,L2,L3) = bundles(G);

    X = sectionZeroLocus sum for i from 1 to r list (dual(det(L1)) tensor d_i) * (det(L3) tensor e_i);
    OmG = cotangentBundle G;
    OmX = cotangentBundle X;
    hodgeNumbers = for i from 0 to floor(dim(X)/2) list (
        (-1)^(i + dim X) * (chi exteriorPower(i, OmX) - chi exteriorPower(i, OmG))
    );
    return hodgeNumbers
);

-- Build the database of Hodge numbers.
computeFlagHodgeNumbers = (nLowBound, nHighBound, rBound) -> (
    db := new MutableHashTable;
    for n from nLowBound to nHighBound do (
        P = partitions(n);
        for p in P do (
            dims = toList p;
            if (#dims > 2) and (#dims < 4)then (
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
db = computeFlagHodgeNumbers(3,5, 3);
exportDatabaseJSON(db, "flag_hodge_numbers.txt");

