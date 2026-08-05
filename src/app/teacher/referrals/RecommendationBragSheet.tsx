import Badge from '@/components/ui/Badge';
import type { RecommendationDetails } from '@/lib/recommendation-details';

interface RecommendationBragSheetProps {
  details: RecommendationDetails;
}

export default function RecommendationBragSheet({ details }: RecommendationBragSheetProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border text-sm overflow-hidden">
      <div className="px-3 py-2 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          The student answered a few questions to help you write a stronger, more specific letter.
        </p>
      </div>

      {(details.courses || details.reasonForChoosing) && (
        <div className="p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Context</p>
          {details.courses && (
            <div>
              <p className="text-xs font-medium text-foreground">Course(s) taken with you</p>
              <p className="text-[11px] text-muted-foreground">So you can recall which class and when</p>
              <p className="text-foreground mt-0.5">{details.courses}</p>
            </div>
          )}
          {details.reasonForChoosing && (
            <div>
              <p className="text-xs font-medium text-foreground">Why they asked you specifically</p>
              <p className="text-foreground mt-0.5">{details.reasonForChoosing}</p>
            </div>
          )}
        </div>
      )}

      {(details.adjectives.length > 0 ||
        details.proudProject ||
        details.favoriteLesson ||
        details.attributes.length > 0 ||
        details.somethingTheyDontKnow) && (
        <div className="p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
            Material for the letter
          </p>
          {details.adjectives.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground">How they'd describe themselves</p>
              <p className="text-foreground mt-0.5">{details.adjectives.join(', ')}</p>
            </div>
          )}
          {details.proudProject && (
            <div>
              <p className="text-xs font-medium text-foreground">A project or piece of work they're proud of</p>
              <p className="text-[11px] text-muted-foreground">A concrete example you can cite</p>
              <p className="text-foreground mt-0.5">{details.proudProject}</p>
            </div>
          )}
          {details.favoriteLesson && (
            <div>
              <p className="text-xs font-medium text-foreground">A lesson or moment in your class they enjoyed</p>
              <p className="text-foreground mt-0.5">{details.favoriteLesson}</p>
            </div>
          )}
          {details.attributes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground mb-1.5">Qualities they'd like you to highlight</p>
              <div className="flex flex-wrap gap-1.5">
                {details.attributes.map((attribute) => (
                  <Badge key={attribute} variant="secondary" size="sm">{attribute}</Badge>
                ))}
              </div>
              {details.attributeStory && (
                <p className="text-foreground mt-1.5">
                  <span className="text-[11px] text-muted-foreground">Supporting story: </span>
                  {details.attributeStory}
                </p>
              )}
            </div>
          )}
          {details.somethingTheyDontKnow && (
            <div>
              <p className="text-xs font-medium text-foreground">Something they think you might not know</p>
              <p className="text-[11px] text-muted-foreground">A personal detail to add color</p>
              <p className="text-foreground mt-0.5">{details.somethingTheyDontKnow}</p>
            </div>
          )}
        </div>
      )}

      {(details.targetColleges || details.intendedMajor || details.additionalInfo) && (
        <div className="p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Where this is going</p>
          {(details.targetColleges || details.intendedMajor) && (
            <div>
              <p className="text-xs font-medium text-foreground">Applying to</p>
              <p className="text-[11px] text-muted-foreground">Tailor examples toward these, if relevant</p>
              <p className="text-foreground mt-0.5">
                {[details.targetColleges, details.intendedMajor].filter(Boolean).join(' · ')}
              </p>
            </div>
          )}
          {details.additionalInfo && (
            <div>
              <p className="text-xs font-medium text-foreground">Anything else from the student</p>
              <p className="text-foreground mt-0.5">{details.additionalInfo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
