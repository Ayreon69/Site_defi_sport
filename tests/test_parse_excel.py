import unittest

from scripts.parse_excel import (
    CleanRow,
    align_first_previsionnel_with_first_realisation,
    drop_previsionnel_before_first_realisation,
    parse_duration_to_seconds,
)


class ParseExcelTests(unittest.TestCase):
    def test_parse_duration_to_seconds(self):
        self.assertEqual(parse_duration_to_seconds("2:30"), 150.0)
        self.assertEqual(parse_duration_to_seconds("1:02:03"), 3723.0)

    def test_drop_previsionnel_before_first_realisation(self):
        rows = [
            CleanRow("Rayan", "2025-06-01", "previsionnel", 0, None, None, None, None, None, None, None),
            CleanRow("Rayan", "2025-08-01", "previsionnel", 7, None, None, None, None, None, None, None),
            CleanRow("Rayan", "2025-06-01", "realisation", None, None, None, None, None, None, None, None),
            CleanRow("Rayan", "2025-08-01", "realisation", 11, None, None, None, None, None, None, None),
        ]

        filtered = drop_previsionnel_before_first_realisation(rows)
        dates = sorted([r.date for r in filtered if r.personne == "Rayan" and r.type == "previsionnel"])
        self.assertEqual(dates, ["2025-08-01"])

    def test_align_first_previsionnel_with_first_realisation(self):
        rows = [
            CleanRow("Rayan", "2025-08-01", "previsionnel", 7, None, None, None, None, None, None, None),
            CleanRow("Rayan", "2025-10-01", "previsionnel", 10, None, None, None, None, None, None, None),
            CleanRow("Rayan", "2025-08-01", "realisation", 11, None, None, None, None, None, None, None),
            CleanRow("Rayan", "2025-10-01", "realisation", 12, None, None, None, None, None, None, None),
        ]

        align_first_previsionnel_with_first_realisation(rows)
        first_prevision = sorted([r for r in rows if r.type == "previsionnel"], key=lambda r: r.date)[0]
        self.assertEqual(first_prevision.dips, 11)


if __name__ == "__main__":
    unittest.main()
