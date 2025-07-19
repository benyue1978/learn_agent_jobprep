import pytest
from src.services.resume_service import resume_service


class TestFieldPathParsing:
    """Test cases for field path parsing functionality"""
    
    def test_simple_field_path(self):
        """Test parsing simple field paths"""
        test_cases = [
            ("basics.name", ["basics", "name"]),
            ("basics.email", ["basics", "email"]),
            ("basics.phone", ["basics", "phone"]),
        ]
        
        for field_path, expected in test_cases:
            result = resume_service._parse_field_path(field_path)
            assert result == expected, f"Failed for {field_path}"
    
    def test_array_field_path(self):
        """Test parsing field paths with array indices"""
        test_cases = [
            ("work[0].description", ["work", 0, "description"]),
            ("work[1].company", ["work", 1, "company"]),
            ("education[0].institution", ["education", 0, "institution"]),
            ("skills[2].name", ["skills", 2, "name"]),
        ]
        
        for field_path, expected in test_cases:
            result = resume_service._parse_field_path(field_path)
            assert result == expected, f"Failed for {field_path}"
    
    def test_nested_array_field_path(self):
        """Test parsing complex nested field paths"""
        test_cases = [
            ("work[0].achievements[1]", ["work", 0, "achievements", 1]),
            ("education[0].courses[2]", ["education", 0, "courses", 2]),
        ]
        
        for field_path, expected in test_cases:
            result = resume_service._parse_field_path(field_path)
            assert result == expected, f"Failed for {field_path}"
    
    def test_invalid_field_paths(self):
        """Test parsing invalid field paths"""
        invalid_paths = [
            "work[",  # Missing closing bracket
            "work[abc]",  # Non-numeric index
            "work[0",  # Missing closing bracket
        ]
        
        for field_path in invalid_paths:
            with pytest.raises((ValueError, IndexError)):
                resume_service._parse_field_path(field_path)
    
    def test_edge_cases(self):
        """Test edge cases for field path parsing"""
        test_cases = [
            ("work[0]", ["work", 0]),  # Just array access
            ("basics", ["basics"]),  # Just field name
            ("work[999].description", ["work", 999, "description"]),  # Large index
        ]
        
        for field_path, expected in test_cases:
            result = resume_service._parse_field_path(field_path)
            assert result == expected, f"Failed for {field_path}" 