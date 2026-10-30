# frozen_string_literal: true

# Ruby 4.0.9 on Windows currently returns an empty result for absolute Dir
# glob patterns. Jekyll uses absolute globs to load its internal modules and
# site files, so patch only that broken case before loading Jekyll.
require "bundler/setup"

if Gem.win_platform? && Gem.ruby_version >= Gem::Version.new("4.0")
  class << Dir
    alias_method :muff1n_original_glob, :glob

    def glob(pattern, flags = 0, **options, &block)
      patterns = pattern.is_a?(Array) ? pattern : [pattern]
      results = patterns.flat_map do |entry|
        unless entry.is_a?(String) && entry.match?(%r{\A[A-Za-z]:[\\/]})
          next muff1n_original_glob(entry, flags, **options)
        end

        normalized = entry.tr("\\", "/")
        wildcard_index = normalized.index(/[\*\?\[\{]/) || normalized.length
        static_prefix = normalized[0...wildcard_index]
        base_directory = File.directory?(static_prefix) ? static_prefix : File.dirname(static_prefix)
        base_directory = base_directory.delete_suffix("/")
        relative_pattern = normalized.delete_prefix("#{base_directory}/")
        relative_results = chdir(base_directory) do
          muff1n_original_glob(relative_pattern, flags, **options)
        end
        relative_results.map { |path| File.join(base_directory, path).tr("\\", "/") }
      end

      if block
        results.each(&block)
        nil
      else
        results
      end
    end

    def [](*patterns, **options)
      glob(patterns.length == 1 ? patterns.first : patterns, 0, **options)
    end
  end
end

jekyll_root = Gem.loaded_specs.fetch("jekyll").full_gem_path
load File.join(jekyll_root, "exe", "jekyll")
