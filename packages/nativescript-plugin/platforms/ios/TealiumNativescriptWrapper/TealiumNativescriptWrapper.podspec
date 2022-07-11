#
# Be sure to run `pod lib lint TealiumNativescriptWrapper.podspec' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'TealiumNativescriptWrapper'
  s.version          = '1.1.4'
  s.summary          = 'ObjC-compatible wrapper for the Tealium Swift library.'

  s.description      = <<-DESC
ObjC-compatible wrapper for the Tealium Swift library to be used with the Tealium NativeScript plugin.
                       DESC

  s.homepage         = 'https://github.com/craigrouse/TealiumNativescriptWrapper'
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.author           = { 'craigrouse' => 'craig.rouse@gmail.com' }
  s.source           = { :git => 'https://github.com/Tealium/tealium-nativescript-plugin.git', :tag => s.version.to_s }

  s.ios.deployment_target = '9.0'

  s.source_files = 'TealiumNativescriptWrapper/Classes/**/*'

  s.dependency  'tealium-swift/Core', "~> 2.6.4"
  s.dependency 'tealium-swift/Lifecycle', "~> 2.6.4"
  s.dependency 'tealium-swift/Collect', "~> 2.6.4"
  s.dependency 'tealium-swift/TagManagement', "~> 2.6.4"
  s.dependency 'tealium-swift/RemoteCommands', "~> 2.6.4"
  s.dependency 'tealium-swift/VisitorService', "~> 2.6.4"
end
