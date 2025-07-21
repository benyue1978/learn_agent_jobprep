# Resume Components

This directory contains the structured resume display components for the `/edit` page.

## Component Structure

```text
components/
└── resume/
├── sections/          # Section-level components
│   ├── BasicInfoSection.tsx
│   ├── EducationSection.tsx
│   ├── ExperienceSection.tsx
│   ├── SkillsSection.tsx
│   └── CertificatesSection.tsx
└── items/            # Item-level components
├── EducationItem.tsx
├── ExperienceItem.tsx
├── SkillItem.tsx
└── CertificateItem.tsx
```

## Design Principles

### Two-Layer Architecture

- **Sections**: Handle the overall layout and structure of each resume section
- **Items**: Handle individual data items within each section

### Component Features

- **Responsive Design**: All components use Tailwind CSS for responsive layouts
- **Dark Mode Support**: Components include dark mode styling
- **Suggestion Placeholders**: Each item includes a placeholder for future suggestion display
- **Accessibility**: Proper semantic HTML and ARIA attributes

### Data Flow

1. `/edit` page fetches resume data from `GET /api/resume`
2. Data is passed to section components
3. Section components map over arrays and render item components
4. Each item component displays individual data with suggestion placeholders

## Usage

```tsx
import BasicInfoSection from '@/components/resume/sections/BasicInfoSection';
import EducationSection from '@/components/resume/sections/EducationSection';
// ... other imports

export default function EditPage() {
  const [resume, setResume] = useState<Resume | null>(null);
  
  return (
    <div>
      <BasicInfoSection basicInfo={resume.basics} />
      <EducationSection education={resume.education} />
      <ExperienceSection work={resume.work} />
      <SkillsSection skills={resume.skills} />
      <CertificatesSection certificates={resume.certificates} />
    </div>
  );
}
```

## Future Enhancements

- **Suggestion Display**: Replace TODO comments with actual suggestion components
- **Edit Functionality**: Add inline editing capabilities
- **Validation**: Add form validation for edited fields
- **Real-time Updates**: Implement real-time suggestion updates
- **Export Options**: Add PDF/Word export functionality

## Testing

All components are covered by Playwright tests in `tests/edit-page.spec.ts`:

- Basic rendering tests
- Structured data display tests
- Error handling tests
- Navigation tests
