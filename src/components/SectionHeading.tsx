interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export const SectionHeading = ({ eyebrow, title, subtitle, align = "center" }: Props) => {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className="text-[11px] uppercase tracking-[0.35em] text-primary mb-4">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground text-balance mb-4 leading-[1.05]">
        {title}
      </h2>
      {align === "center" && (
        <div className="gold-divider mb-5">
          <span className="text-primary text-xs">✦</span>
        </div>
      )}
      {subtitle && (
        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
